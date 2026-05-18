import React from 'react';
import {
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAuth } from 'context/AuthContext';

function StatCard({ label, value, sub }) {
  const bg = useColorModeValue('white', 'navy.800');
  return (
    <Box bg={bg} p="24px" borderRadius="16px" boxShadow="0 4px 18px rgba(112,144,176,0.08)">
      <Stat>
        <StatLabel color="secondaryGray.600" fontSize="sm">
          {label}
        </StatLabel>
        <StatNumber fontSize="3xl" fontWeight="700">
          {value}
        </StatNumber>
        {sub && (
          <Text mt="6px" color="secondaryGray.500" fontSize="sm">
            {sub}
          </Text>
        )}
      </Stat>
    </Box>
  );
}

export default function Dashboard() {
  const { user, permissions } = useAuth();
  const greeting = user ? `Welcome back, ${user.firstName}` : 'Welcome';

  return (
    <Box pt={{ base: '120px', md: '80px', xl: '80px' }}>
      <Flex direction="column" mb="24px">
        <Heading size="lg" mb="4px">
          {greeting}
        </Heading>
        <Text color="secondaryGray.600">
          Here's a quick look at your recovery system.
        </Text>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing="20px" mb="24px">
        <StatCard label="Active permissions" value={permissions.length} sub="Granted to you" />
        <StatCard label="Roles assigned" value={user?.roles?.length || 0} />
        <StatCard label="Account" value={user?.isActive ? 'Active' : 'Inactive'} />
        <StatCard label="Email" value={user?.email || '—'} />
      </SimpleGrid>

      <Box
        bg={useColorModeValue('white', 'navy.800')}
        p="24px"
        borderRadius="16px"
        boxShadow="0 4px 18px rgba(112,144,176,0.08)"
      >
        <Heading size="md" mb="12px">
          Getting started
        </Heading>
        <Text color="secondaryGray.600" lineHeight="tall">
          Use the sidebar to manage <b>Users</b>, <b>Roles</b>, and <b>Permissions</b>. Roles bundle
          permissions (Spatie-style) and are assigned to users. The recovery API is wired and ready —
          customers request, providers bid, and requesters accept.
        </Text>
      </Box>
    </Box>
  );
}
