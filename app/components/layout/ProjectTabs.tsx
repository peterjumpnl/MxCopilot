'use client'

import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Spinner,
  Center,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import ChatInterface from '../chat/ChatInterface'
import ModuleList from '../ModuleList'
import { Module } from '@/app/types'

interface ProjectTabsProps {
  projectId: string
}

export default function ProjectTabs({ projectId }: ProjectTabsProps) {
  const [modules, setModules] = useState<Module[]>([])
  const [isLoadingModules, setIsLoadingModules] = useState(false)
  const [selectedTab, setSelectedTab] = useState(0)

  const loadModules = async () => {
    if (selectedTab === 1 && modules.length === 0) {
      setIsLoadingModules(true)
      try {
        const response = await fetch('/api/mendix', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ projectId }),
        })

        if (!response.ok) throw new Error('Failed to load modules')

        const data = await response.json()
        setModules(data.modules || [])
      } catch (error) {
        console.error('Error loading modules:', error)
      } finally {
        setIsLoadingModules(false)
      }
    }
  }

  useEffect(() => {
    loadModules()
  }, [selectedTab])

  return (
    <Box w="full">
      <Tabs 
        variant="enclosed" 
        colorScheme="blue" 
        index={selectedTab}
        onChange={setSelectedTab}
      >
        <TabList>
          <Tab>Chat</Tab>
          <Tab>Project Details</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <ChatInterface projectId={projectId} />
          </TabPanel>
          <TabPanel>
            {isLoadingModules ? (
              <Center py={8}>
                <Spinner size="xl" />
              </Center>
            ) : (
              <ModuleList modules={modules} />
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}
