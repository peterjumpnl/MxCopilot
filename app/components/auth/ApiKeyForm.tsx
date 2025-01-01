'use client'

import {
  VStack,
  Input,
  Button,
  Heading,
  Text,
  Card,
  CardBody,
} from '@chakra-ui/react'

interface ApiKeyFormProps {
  pat: string
  openaiKey: string
  onPatChange: (value: string) => void
  onOpenAiKeyChange: (value: string) => void
  onSubmit: () => void
  isLoading?: boolean
}

export default function ApiKeyForm({
  pat,
  openaiKey,
  onPatChange,
  onOpenAiKeyChange,
  onSubmit,
  isLoading
}: ApiKeyFormProps) {
  return (
    <Card>
      <CardBody>
        <VStack spacing={6}>
          <Heading size="lg">Welcome to MX Copilot</Heading>
          <Text>Please enter your API keys to get started</Text>
          <Input
            placeholder="Mendix PAT Token"
            type="password"
            value={pat}
            onChange={(e) => onPatChange(e.target.value)}
          />
          <Input
            placeholder="OpenAI API Key"
            type="password"
            value={openaiKey}
            onChange={(e) => onOpenAiKeyChange(e.target.value)}
          />
          <Button
            colorScheme="blue"
            width="full"
            onClick={onSubmit}
            isDisabled={!pat || !openaiKey}
            isLoading={isLoading}
          >
            Continue
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}
