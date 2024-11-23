import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Flex,
  Image,
  Text,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  VStack,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { FaPlay, FaPause } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { AxiosInstance } from 'axios';
import { keyframes } from '@emotion/react';
import { useTranslation } from 'react-i18next';

interface Podcast {
  id: string;
  title: string;
  description: string;
  url: string;
  coverImage: string;
  status: string;
}

interface AudioPlayerProps {
  podcast: Podcast | null;
  axiosInstance: AxiosInstance;
}
//@ts-expect-error expected error
const MotionBox = motion(Box);
//@ts-expect-error expected error
const MotionIconButton = motion(IconButton);

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeOut = keyframes`
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(10px); }
`;

const AudioPlayer: React.FC<AudioPlayerProps> = ({ podcast, axiosInstance }) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  const toast = useToast();

  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);

  useEffect(() => {
    if (podcast) {
      console.log('Podcast object:', {
        ...podcast,
        hasStatus: podcast.status !== undefined,
        descriptionStatus: podcast.description.includes('Status: ready'),
      });
      setIsLoading(true);
      loadAudio();
    }
    return () => {
      if (mediaSourceRef.current) {
        if (audioRef.current) {
          URL.revokeObjectURL(audioRef.current.src);
        }
      }
    };
  }, [podcast]);

  const loadAudio = async () => {
    if (!podcast || !audioRef.current) return;

    try {
      // Load audio
      const response = await axiosInstance.get(podcast.url, {
        responseType: 'blob',
      });

      const audioBlob = response.data;
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioUrl;

      try {
        console.log('Attempting to load subtitles');
        const subtitleUrl = `/podcast/get-subtitle/${podcast.id}`;
        console.log('Requesting subtitles from:', subtitleUrl);

        const subtitleResponse = await axiosInstance.get(subtitleUrl, {
          responseType: 'blob',
          headers: {
            'Accept': 'text/vtt',
          },
        });

        console.log('Subtitle response received:', subtitleResponse);

        if (subtitleResponse.data) {
          const subtitleBlob = new Blob([subtitleResponse.data], {
            type: 'text/vtt'
          });
          const subtitleObjectUrl = URL.createObjectURL(subtitleBlob);

          // Remove any existing tracks
          const tracks = audioRef.current.getElementsByTagName('track');
          while (tracks.length > 0) {
            audioRef.current.removeChild(tracks[0]);
          }

          // Create and add the track
          const track = document.createElement('track');
          track.kind = 'subtitles';
          track.label = 'English';
          track.srclang = 'en';
          track.src = subtitleObjectUrl;
          track.default = true;

          audioRef.current.appendChild(track);

          // Force the track to be active
          setTimeout(() => {
            if (audioRef.current?.textTracks[0]) {
              audioRef.current.textTracks[0].mode = 'showing';
              console.log('Track mode set to showing');
            }
          }, 100);

          console.log('Track added:', {
            src: subtitleObjectUrl,
            tracks: audioRef.current.textTracks.length,
            mode: audioRef.current.textTracks[0]?.mode
          });
        }
      } catch (error) {
        console.error('Error loading subtitles:', error);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading audio:', error);
      setIsLoading(false);
      toast({
        title: t('podcast.audioError.title'),
        description: t('podcast.audioError.description'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
          toast({
            title: t('podcast.playbackError.title'),
            description: t('podcast.playbackError.description'),
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleSliderChange = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const toggleSubtitles = () => {
    console.log('Toggling subtitles, current state:', showSubtitles);
    if (audioRef.current && audioRef.current.textTracks.length > 0) {
      const track = audioRef.current.textTracks[0];
      console.log('Current track mode:', track.mode);

      // Add fade out animation before hiding
      if (showSubtitles) {
        const subtitleElement = document.querySelector('[data-subtitle]');
        if (subtitleElement) {
          subtitleElement.animate(
            [
              { opacity: 1, transform: 'translateY(0)' },
              { opacity: 0, transform: 'translateY(10px)' }
            ],
            {
              duration: 300,
              easing: 'ease-out'
            }
          ).onfinish = () => {
            track.mode = 'hidden';
            setCurrentSubtitle('');
          };
        }
      } else {
        track.mode = 'showing';
        const activeCues = track.activeCues;
        if (activeCues && activeCues.length > 0) {
          const cue = activeCues[0] as VTTCue;
          setCurrentSubtitle(cue.text);
        }
      }
      setShowSubtitles(!showSubtitles);
    } else {
      console.log('No text tracks available');
    }
  };

  const handleCueChange = () => {
    console.log('Cue change event fired');
    if (audioRef.current && audioRef.current.textTracks[0]) {
      const track = audioRef.current.textTracks[0];
      const activeCues = track.activeCues;
      console.log('Active cues:', activeCues);
      if (activeCues && activeCues.length > 0) {
        const cue = activeCues[0] as VTTCue;
        setCurrentSubtitle(cue.text);
      } else {
        setCurrentSubtitle('');
      }
    }
  };

  useEffect(() => {
    const setupTrack = () => {
      if (audioRef.current && audioRef.current.textTracks[0]) {
        console.log('Setting up track in useEffect');
        const track = audioRef.current.textTracks[0];
        track.mode = 'showing';
        track.addEventListener('cuechange', handleCueChange);
        return () => {
          track.removeEventListener('cuechange', handleCueChange);
        };
      }
    };

    // Try to set up track immediately and after a delay
    const cleanup = setupTrack();
    const timeoutId = setTimeout(setupTrack, 1000);

    return () => {
      cleanup?.();
      clearTimeout(timeoutId);
    };
  }, [audioRef.current]);

  const handleError = () => {
    setIsLoading(false);
    toast({
      title: t('podcast.audioError.title'),
      description: t('podcast.audioError.description'),
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  };

  if (!podcast) return null;

  return (
    <MotionBox
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      height="80px"
      bg="white"
      boxShadow="0 -4px 12px 0 rgba(0, 0, 0, 0.05)"
      borderTopRadius="xl"
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      zIndex={50}
    >
      {currentSubtitle && showSubtitles && (
        <Box
          position="fixed"
          bottom="100px"
          left="50%"
          transform="translateX(-50%)"
          width="90%"
          maxW="900px"
          zIndex={40}
          animation={`${fadeIn} 0.3s ease-out`}
          pointerEvents="none"
        >
          <Box
            bg="rgba(0, 0, 0, 0.75)"
            backdropFilter="blur(8px)"
            borderRadius="xl"
            boxShadow="lg"
            p={4}
            display="flex"
            alignItems="center"
            justifyContent="center"
            transition="all 0.3s ease"
          >
            <Text
              fontSize="xl"
              color="white"
              textAlign="center"
              whiteSpace="pre-wrap"
              lineHeight="1.6"
              fontWeight="medium"
              sx={{
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                animation: `${currentSubtitle ? fadeIn : fadeOut} 0.3s ease-out`,
              }}
            >
              {currentSubtitle}
            </Text>
          </Box>
        </Box>
      )}
      <Flex align="center" justify="space-between" h="80px" px={6} maxW="container.xl" mx="auto">
        <Flex align="center" flex={1}>
          <Image src={podcast.coverImage} alt={podcast.title} boxSize="50px" mr={4} borderRadius="md" objectFit="cover" />
          <VStack align="start" spacing={0}>
            <Text fontWeight="bold" color="#10B981" fontSize="sm">{podcast.title}</Text>
            <Text fontSize="xs" color="gray.600" noOfLines={1}>{podcast.description}</Text>
          </VStack>
        </Flex>
        <Flex align="center" justify="center" flex={1}>
          <MotionIconButton
            aria-label={isPlaying ? t('podcast.pause') : t('podcast.play')}
            icon={isLoading ? <Spinner /> : isPlaying ? <FaPause /> : <FaPlay />}
            size="md"
            mr={2}
            onClick={togglePlayPause}
            bg="#10B981"
            color="white"
            _hover={{ bg: '#0E9F6E' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            isDisabled={isLoading}
          />
          <IconButton
            aria-label={showSubtitles
              ? t('podcast.subtitlesToggle.hide')
              : t('podcast.subtitlesToggle.show')
            }
            icon={showSubtitles ? <Text>CC</Text> : <Text>cc</Text>}
            size="sm"
            onClick={toggleSubtitles}
            bg={showSubtitles ? "#10B981" : "gray.200"}
            color={showSubtitles ? "white" : "gray.600"}
            _hover={{ bg: showSubtitles ? '#0E9F6E' : 'gray.300' }}
          />
        </Flex>
        <Flex align="center" flex={1} justifyContent="flex-end">
          <Box width="200px">
            <Slider
              aria-label="podcast-progress"
              value={currentTime}
              min={0}
              max={duration || 100}
              onChange={handleSliderChange}
              size="sm"
              isDisabled={isLoading}
            >
              <SliderTrack bg="gray.200">
                <SliderFilledTrack bg="#10B981" />
              </SliderTrack>
              <SliderThumb boxSize={3} bg="#10B981" />
            </Slider>
          </Box>
        </Flex>
      </Flex>
      <audio
        ref={audioRef}
        controls
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onError={handleError}
        crossOrigin="anonymous"
      />
    </MotionBox>
  );
};

export default AudioPlayer;