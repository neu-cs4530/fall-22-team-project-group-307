import { Center, Text } from '@chakra-ui/react';
import React from 'react';

interface TileProps {
  letter: string;
  color: string;
  order?: number;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const Tile = ({ letter, color }: TileProps) => {
  return (
    <Center
      w={['50px', '55px', '60px']}
      h={['50px', '55px', '60px']}
      border='1px'
      backgroundColor={color}
      borderColor='gray.700'
      userSelect='none'>
      <Text fontWeight={700} fontSize='x-large'>
        {letter.toUpperCase()}
      </Text>
    </Center>
  );
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const EmptyTile = ({ showCursor }: { showCursor?: boolean }) => (
  <Center
    w={['50px', '55px', '60px']}
    h={['50px', '55px', '60px']}
    border='1px'
    borderColor={'gray.700'}
    userSelect='none'>
    {showCursor && <Text fontSize='x-large'>_</Text>}
  </Center>
);

export { Tile, EmptyTile };
