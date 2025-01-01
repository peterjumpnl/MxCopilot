import {
  VStack,
  Box,
  Heading,
  List,
  ListItem,
  Text,
  Spinner,
} from '@chakra-ui/react'

interface Module {
  name: string
  type: string
}

interface ModuleListProps {
  modules: Module[]
  isLoading: boolean
}

export default function ModuleList({ modules, isLoading }: ModuleListProps) {
  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading project modules...</Text>
      </Box>
    )
  }

  return (
    <VStack spacing={4} align="stretch">
      <Heading size="md">Project Modules</Heading>
      <List spacing={3}>
        {modules.map((module, index) => (
          <ListItem
            key={index}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            _hover={{ bg: 'gray.50' }}
          >
            <Text fontWeight="bold">{module.name}</Text>
            <Text fontSize="sm" color="gray.600">
              Type: {module.type}
            </Text>
          </ListItem>
        ))}
      </List>
    </VStack>
  )
}
