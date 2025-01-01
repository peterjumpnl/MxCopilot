'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  VStack,
  Input,
  Button,
  Heading,
  Text,
  useToast,
  Card,
  CardBody,
  Select,
  HStack,
  Spinner,
} from '@chakra-ui/react'
import ProjectTabs from './components/layout/ProjectTabs'
import ProjectSelector from './components/projects/ProjectSelector'
import { Module, MendixProject } from './types'

export default function Home() {
  const [step, setStep] = useState<'auth' | 'project' | 'modules'>('auth')
  const [pat, setPat] = useState('')
  const [openaiKey, setOpenaiKey] = useState('')
  const [projectId, setProjectId] = useState('')
  const [modules, setModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [projects, setProjects] = useState<MendixProject[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const toast = useToast()
  const router = useRouter()

  useEffect(() => {
    checkStoredKeys()
  }, [])

  useEffect(() => {
    if (step === 'project') {
      loadProjects()
    }
  }, [step])

  const checkStoredKeys = async () => {
    try {
      const response = await fetch('/api/auth/check')
      if (response.ok) {
        const data = await response.json()
        if (data.hasKeys) {
          setPat(data.pat)
          setOpenaiKey(data.openaiKey)
          setStep('project')
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check stored API keys',
        status: 'error',
      })
    } finally {
      setIsCheckingAuth(false)
    }
  }

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects/sync')
      if (response.ok) {
        const data = await response.json()
        if (data.projects?.length > 0) {
          setProjects(data.projects)
        } else {
          console.log('No projects found in response:', data)
        }
      } else {
        const error = await response.json()
        console.error('Error loading projects:', error)
        toast({
          title: 'Error',
          description: error.error || 'Failed to load projects',
          status: 'error',
        })
      }
    } catch (error) {
      console.error('Error in loadProjects:', error)
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        status: 'error',
      })
    }
  }

  const syncProjects = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch('/api/projects/sync', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (response.ok) {
        if (data.projects?.length > 0) {
          setProjects(data.projects)
          toast({
            title: 'Success',
            description: `Synchronized ${data.projects.length} projects`,
            status: 'success',
          })
        } else {
          console.log('No projects found in sync response:', data)
          toast({
            title: 'Warning',
            description: 'No projects found. Please check your PAT token permissions.',
            status: 'warning',
          })
        }
      } else {
        console.error('Error syncing projects:', data)
        toast({
          title: 'Error',
          description: data.error || 'Failed to sync projects',
          status: 'error',
          duration: 10000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Error in syncProjects:', error)
      toast({
        title: 'Error',
        description: 'Network error while syncing projects',
        status: 'error',
        duration: 10000,
        isClosable: true,
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleAuthSubmit = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pat, openaiKey }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setStep('project')
        await loadProjects() // Ensure projects are loaded before changing step
        toast({
          title: 'Success',
          description: 'API keys stored successfully',
          status: 'success',
        })
      } else {
        throw new Error(data.error || 'Failed to store API keys')
      }
    } catch (error: any) {
      console.error('Error storing API keys:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to store API keys',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleProjectIdChange = async (id: string) => {
    setProjectId(id)
    
    // If ID is manually entered and not in current projects list
    if (id && !projects.find(p => p.id === id)) {
      try {
        const response = await fetch('/api/projects/lookup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ projectId: id }),
        })

        if (response.ok) {
          const data = await response.json()
          // Add the new project to the list if it's not already there
          setProjects(prev => {
            if (!prev.find(p => p.id === data.project.id)) {
              return [...prev, data.project]
            }
            return prev
          })
        }
      } catch (error) {
        console.error('Error looking up project:', error)
      }
    }
  }

  const handleOpenProject = async () => {
    if (!projectId) return

    setIsLoading(true)
    try {
      // Record project access
      const selectedProject = projects.find(p => p.id === projectId)
      await fetch('/api/projects/access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          projectName: selectedProject?.name
        }),
      })

      // Navigate to the chat page with project ID
      router.push(`/chat/${projectId}`)
    } catch (error) {
      console.error('Error opening project:', error)
      toast({
        title: 'Error',
        description: 'Failed to open project',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <Container maxW="container.md" py={20}>
        <Box textAlign="center">
          <Text>Loading...</Text>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" py={20}>
      <VStack spacing={8} align="stretch">
        {step === 'auth' ? (
          <Card>
            <CardBody>
              <VStack spacing={6}>
                <Heading size="lg">Welcome to MX Copilot</Heading>
                <Text>Please enter your API keys to get started</Text>
                <Input
                  placeholder="Mendix PAT Token"
                  type="password"
                  value={pat}
                  onChange={(e) => setPat(e.target.value)}
                />
                <Input
                  placeholder="OpenAI API Key"
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                />
                <Button
                  colorScheme="blue"
                  width="full"
                  onClick={handleAuthSubmit}
                  isDisabled={!pat || !openaiKey}
                  isLoading={isLoading}
                >
                  Continue
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ) : step === 'project' ? (
          <ProjectSelector
            projects={projects}
            projectId={projectId}
            onProjectIdChange={handleProjectIdChange}
            onRefresh={syncProjects}
            onOpen={handleOpenProject}
            isRefreshing={isSyncing}
            isLoading={isLoading}
          />
        ) : (
          <ProjectTabs projectId={projectId} />
        )}
      </VStack>
    </Container>
  )
}
