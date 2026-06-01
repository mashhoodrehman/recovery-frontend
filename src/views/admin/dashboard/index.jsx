import React from 'react';
import {
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import {
  MdPeople,
  MdLocalShipping,
  MdBusiness,
  MdDirectionsCar,
  MdWork,
  MdCheckCircle,
  MdAttachMoney,
  MdAccountBalanceWallet,
} from 'react-icons/md';
import { useAuth } from 'context/AuthContext';
import { dashboardService } from 'services/dashboard.service';

const STATUS_COLORS = {
  open: 'blue',
  assigned: 'purple',
  in_progress: 'orange',
  completed: 'green',
  cancelled: 'red',
};

function StatCard({ label, value, icon, accent }) {
  const bg = useColorModeValue('white', 'navy.800');
  const iconBg = useColorModeValue(`${accent}.50`, 'navy.700');
  const iconColor = useColorModeValue(`${accent}.500`, `${accent}.200`);
  return (
    <Box bg={bg} p="20px" borderRadius="16px" boxShadow="0 4px 18px rgba(112,144,176,0.08)">
      <Flex align="center" gap="16px">
        <Flex
          align="center"
          justify="center"
          w="56px"
          h="56px"
          borderRadius="14px"
          bg={iconBg}
          color={iconColor}
          fontSize="26px"
          flexShrink={0}
        >
          {icon}
        </Flex>
        <Stat>
          <StatLabel color="secondaryGray.600" fontSize="sm">
            {label}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="700">
            {value}
          </StatNumber>
        </Stat>
      </Flex>
    </Box>
  );
}

const money = (n) => `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

export default function Dashboard() {
  const { user } = useAuth();
  const cardBg = useColorModeValue('white', 'navy.800');
  const headBg = useColorModeValue('secondaryGray.300', 'navy.700');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.stats,
  });

  const greeting = user ? `Welcome back, ${user.firstName}` : 'Welcome';

  return (
    <Box pt={{ base: '120px', md: '80px', xl: '80px' }}>
      <Flex direction="column" mb="24px">
        <Heading size="lg" mb="4px">
          {greeting}
        </Heading>
        <Text color="secondaryGray.600">Platform overview at a glance.</Text>
      </Flex>

      {isLoading ? (
        <Flex justify="center" p="60px">
          <Spinner size="lg" />
        </Flex>
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing="20px" mb="20px">
            <StatCard label="Customers" value={stats?.totalCustomers ?? 0} icon={<MdPeople />} accent="blue" />
            <StatCard label="Vendors" value={stats?.totalVendors ?? 0} icon={<MdLocalShipping />} accent="purple" />
            <StatCard label="Companies" value={stats?.totalCompanies ?? 0} icon={<MdBusiness />} accent="teal" />
            <StatCard label="Vehicles" value={stats?.totalVehicles ?? 0} icon={<MdDirectionsCar />} accent="cyan" />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing="20px" mb="24px">
            <StatCard label="Active Jobs" value={stats?.activeJobs ?? 0} icon={<MdWork />} accent="orange" />
            <StatCard label="Completed Jobs" value={stats?.completedJobs ?? 0} icon={<MdCheckCircle />} accent="green" />
            <StatCard label="Total Revenue" value={money(stats?.totalRevenue)} icon={<MdAttachMoney />} accent="green" />
            <StatCard
              label="Pending Withdrawals"
              value={money(stats?.pendingWithdrawals?.amount)}
              icon={<MdAccountBalanceWallet />}
              accent="red"
            />
          </SimpleGrid>

          <Box bg={cardBg} borderRadius="16px" boxShadow="0 4px 18px rgba(112,144,176,0.08)" overflow="hidden">
            <Heading size="md" p="20px" pb="12px">
              Recent Requests
            </Heading>
            <TableContainer>
              <Table variant="simple">
                <Thead bg={headBg}>
                  <Tr>
                    <Th>#</Th>
                    <Th>Requester</Th>
                    <Th>Pickup</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {(stats?.recentRequests || []).length === 0 && (
                    <Tr>
                      <Td colSpan={4}>
                        <Text textAlign="center" color="gray.500" p="24px">
                          No requests yet
                        </Text>
                      </Td>
                    </Tr>
                  )}
                  {(stats?.recentRequests || []).map((r) => (
                    <Tr key={r.id}>
                      <Td fontWeight="600">#{r.id}</Td>
                      <Td>
                        {r.requester
                          ? `${r.requester.firstName} ${r.requester.lastName || ''}`
                          : '—'}
                      </Td>
                      <Td maxW="280px" isTruncated>
                        {r.pickupAddress}
                      </Td>
                      <Td>
                        <Badge colorScheme={STATUS_COLORS[r.status] || 'gray'}>{r.status}</Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </>
      )}
    </Box>
  );
}
