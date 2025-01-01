'use client'

import {
  VStack,
  HStack,
  Box,
  Input,
  Button,
  Heading,
  Text,
  Card,
  CardBody,
  Select,
  Divider,
  SimpleGrid,
} from '@chakra-ui/react'
import { MendixProject } from '@prisma/client'

interface ProjectWithAccess extends MendixProject {
  isRecentlyAccessed?: boolean
  lastAccessed?: Date
}

interface ProjectSelectorProps {
  projects: ProjectWithAccess[]
  projectId: string
  onProjectIdChange: (id: string) => void
  onRefresh: () => void
  onOpen: () => void
  isRefreshing?: boolean
  isLoading?: boolean
}

export default function ProjectSelector({
  projects,
  projectId,
  onProjectIdChange,
  onRefresh,
  onOpen,
  isRefreshing,
  isLoading
}: ProjectSelectorProps) {
  // Sort recent projects by lastAccessed
  const recentProjects = projects
    .filter(p => p.isRecentlyAccessed)
    .sort((a, b) => {
      if (!a.lastAccessed || !b.lastAccessed) return 0
      return b.lastAccessed.getTime() - a.lastAccessed.getTime()
    })
    .slice(0, 3)

  const otherProjects = projects.filter(p => !p.isRecentlyAccessed)

  const handleRecentProjectClick = (id: string) => {
    onProjectIdChange(id)
    onOpen()
  }

  return (
    <Card>
      <CardBody>
        <VStack spacing={6}>
          <Heading size="lg">Project Selection</Heading>
          
          {/* Recent Projects */}
          {recentProjects.length > 0 && (
            <Box width="full">
              <Text mb={4} fontWeight="medium">Recently Accessed Projects:</Text>
              <SimpleGrid columns={3} spacing={4}>
                {recentProjects.map((project) => (
                  <Card 
                    key={project.id} 
                    variant="outline" 
                    cursor="pointer"
                    _hover={{ bg: 'gray.50' }}
                    onClick={() => handleRecentProjectClick(project.id)}
                  >
                    <CardBody>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">{project.name}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {project.lastAccessed ? new Date(project.lastAccessed).toLocaleDateString() : ''}
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </Box>
          )}

          <Divider />
          
          <VStack width="full" spacing={4}>
            <Box width="full">
              <Text mb={2} fontWeight="medium">Select from your projects:</Text>
              <HStack width="full">
                <Select
                  placeholder="Select a project"
                  value={projectId}
                  onChange={(e) => onProjectIdChange(e.target.value)}
                >
                  {otherProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </Select>
                <Button
                  onClick={onRefresh}
                  isLoading={isRefreshing}
                  loadingText="Syncing"
                >
                  Refresh
                </Button>
              </HStack>
            </Box>

            <Box width="full">
              <Text mb={2} fontWeight="medium">Or enter a project ID:</Text>
              <Input
                placeholder="Enter project ID manually"
                value={projectId}
                onChange={(e) => onProjectIdChange(e.target.value)}
              />
            </Box>
          </VStack>

          <Button
            colorScheme="blue"
            width="full"
            onClick={onOpen}
            isDisabled={!projectId}
            isLoading={isLoading}
          >
            Open Project
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}
