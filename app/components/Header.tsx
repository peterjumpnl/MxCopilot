'use client'

import { Box, Flex, Heading, Button, useColorModeValue } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box
      as="header"
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      position="fixed"
      width="100%"
      top={0}
      zIndex={10}
    >
      <Flex
        maxW="container.xl"
        mx="auto"
        px={4}
        py={3}
        align="center"
        justify="space-between"
      >
        <Heading size="md" cursor="pointer" onClick={() => router.push('/')}>
          MxCopilot
        </Heading>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => router.push('/configure')}
        >
          Configure
        </Button>
      </Flex>
    </Box>
  )
}
