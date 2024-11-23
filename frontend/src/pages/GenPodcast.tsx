import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  useToast,
  SimpleGrid,
  VStack,
} from '@chakra-ui/react';
import axios from '../api/axios';
import PodcastForm from '../components/podcastGen/PodcastForm';
import PodcastCard from '../components/podcastGen/PodcastCard';
import AudioPlayer from '../components/podcastGen/AudioPlayer';
import { useTranslation } from 'react-i18next';

interface Podcast {
  id: string;
  prompt: string;
  status: string;
  coverUrl?: string;
}

const GenPodcast: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState('');
  const [generatedPodcasts, setGeneratedPodcasts] = useState<Podcast[]>([]);
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language.split('-')[0]);
  const toast = useToast();

  const fetchPodcasts = async () => {
    try {
      const response = await axios.get('/podcast/user-podcasts');
      const podcastsWithCovers = await Promise.all(
        response.data.map(async (podcast: Podcast) => {
          try {
            const coverResponse = await axios.get(`/podcast/get-cover/${podcast.id}`, {
              responseType: 'blob'
            });
            const coverUrl = URL.createObjectURL(coverResponse.data);
            return { ...podcast, coverUrl };
          } catch (error) {
            console.error(`Failed to fetch cover for podcast ${podcast.id}:`, error);
            return podcast;
          }
        })
      );
      setGeneratedPodcasts(podcastsWithCovers);
    } catch (error) {
      console.error('Error fetching podcasts:', error);
      toast({
        title: t('podcast.audioError.title'),
        description: t('podcast.audioError.description'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const handleGeneratePodcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('/ai/generate-podcast', {
        content: theme,
        language: selectedLanguage
      });
      toast({
        title: t('podcast.generate'),
        description: t('podcast.generationStarted'),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      await fetchPodcasts();
    } catch (error) {
      console.error('Podcast generation error:', error);
      toast({
        title: t('podcast.generationFailed'),
        description: t('podcast.tryAgain'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };

  const handlePlayPodcast = (podcast: Podcast) => {
    if (podcast.status !== 'ready') {
      toast({
        title: 'Podcast not ready',
        description: 'This podcast is still being generated. Please wait.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setCurrentPodcast(podcast);
  };

  return (
    <Box width="100%" minHeight="100vh" bg="transparent" pt={8} pb={24}>
      <Container maxW="container.xl">
        <VStack spacing={12} align="stretch">
          <Heading as="h1" size="2xl" textAlign="center" color="#10B981" fontWeight="bold">
            {t('podcast.generate')}
          </Heading>
          <PodcastForm
            theme={theme}
            setTheme={setTheme}
            handleGeneratePodcast={handleGeneratePodcast}
            isLoading={isLoading}
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
          />
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {generatedPodcasts.map((podcast) => (
              <PodcastCard
                key={podcast.id}
                podcast={{
                  id: podcast.id,
                  title: podcast.prompt,
                  description: `Status: ${podcast.status}`,
                  url: `/podcast/stream-audio/${podcast.id}`,
                  coverImage: podcast.coverUrl || ''
                }}
                onPlay={() => handlePlayPodcast(podcast)}
              />
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
      {currentPodcast && (
        <Box position="fixed" bottom={0} left={0} right={0} zIndex={1000}>
          <AudioPlayer
            podcast={{
              id: currentPodcast.id,
              title: currentPodcast.prompt,
              description: `Status: ${currentPodcast.status}`,
              url: `/podcast/stream-audio/${currentPodcast.id}`,
              status: currentPodcast.status,
              coverImage: currentPodcast.coverUrl || ''
            }}
            axiosInstance={axios}
          />
        </Box>
      )}
    </Box>
  );
};

export default GenPodcast;