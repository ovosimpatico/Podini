import React from 'react';
import {
  Image,
  Text,
  Button,
  VStack,
  Card,
  CardBody,
  Heading,
} from '@chakra-ui/react';
import { FaPlay } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface Podcast {
  id: string;
  title: string;
  description: string;
  url: string;
  coverImage: string;
}

interface PodcastCardProps {
  podcast: Podcast;
  onPlay: () => void;
}

const PodcastCard: React.FC<PodcastCardProps> = ({ podcast, onPlay }) => {
  const { t } = useTranslation();

  return (
    <Card
      borderRadius="20px"
      overflow="hidden"
      boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.05)"
      transition="all 0.3s ease"
      _hover={{ transform: 'translateY(-5px)', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)' }}
      bg="rgba(255, 255, 255, 0.7)"
      backdropFilter="blur(2px)"
    >
      <Image src={podcast.coverImage} alt={podcast.title} width="100%" height="200px" objectFit="cover" />
      <CardBody>
        <VStack align="start" spacing={4}>
          <Heading as="h3" size="md" color="#10B981">
            {podcast.title}
          </Heading>
          <Text fontSize="sm" color="gray.600" noOfLines={3}>
            {podcast.description}
          </Text>
          <Button
            leftIcon={<FaPlay />}
            bg="#10B981"
            color="white"
            _hover={{ bg: 'green.600' }}
            size="sm"
            onClick={onPlay}
            borderRadius="full"
            boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
          >
            {t('podcast.play')}
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default PodcastCard;