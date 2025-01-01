'use client'

import { useEffect, useState } from 'react'
import { Box, Heading, Text, HStack, Skeleton, Badge } from '@chakra-ui/react'
import { MendixProject } from '@/app/types'

interface ProjectHeaderProps {
  projectId: string
}

export default function ProjectHeader({ projectId }: ProjectHeaderProps) {
  const [project, setProject] = useState<MendixProject | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await fetch(`/api/projects/lookup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ projectId }),
        })

        if (response.ok) {
          const data = await response.json()
          setProject(data.project)
        }
      } catch (error) {
        console.error('Error loading project:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProject()
  }, [projectId])

  return (
    <Box mb={4}>
      <HStack spacing={4} align="baseline">
        {isLoading ? (
          <>
            <Skeleton height="24px" width="200px" />
            <Skeleton height="16px" width="300px" />
          </>
        ) : (
          <>
            <Heading size="lg">{project?.name || 'Unknown Project'}</Heading>
            <Badge colorScheme="blue" fontSize="sm">
              {projectId}
            </Badge>
          </>
        )}
      </HStack>
      {!isLoading && project?.description && (
        <Text color="gray.600" mt={2}>
          {project.description}
        </Text>
      )}
    </Box>
  )
}
