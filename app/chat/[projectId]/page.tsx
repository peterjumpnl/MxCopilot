'use client'

import { useParams } from 'next/navigation'
import { Box, Container, VStack } from '@chakra-ui/react'
import ProjectTabs from '@/app/components/layout/ProjectTabs'
import ProjectHeader from '@/app/components/projects/ProjectHeader'

export default function ChatPage() {
  const params = useParams()
  const projectId = params.projectId as string

  return (
    <Container maxW="container.xl" pt={20}>
      <VStack spacing={4} align="stretch">
        <ProjectHeader projectId={projectId} />
        <ProjectTabs projectId={projectId} />
      </VStack>
    </Container>
  )
}
