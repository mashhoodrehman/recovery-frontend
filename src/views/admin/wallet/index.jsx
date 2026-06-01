import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  SimpleGrid,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { walletsService } from 'services/wallets.service';

const money = (n, c = 'USD') => `${c} ${Number(n || 0).toFixed(2)}`;
const TX_COLORS = {
  job_earning: 'green',
  commission_deduction: 'red',
  withdrawal_request: 'orange',
  withdrawal_approved: 'blue',
  withdrawal_rejected: 'gray',
  manual_adjustment: 'purple',
};

function BalanceCard({ label, value }) {
  const bg = useColorModeValue('white', 'navy.800');
  return (
    <Box bg={bg} p="24px" borderRadius="16px" boxShadow="0 4px 18px rgba(112,144,176,0.08)">
      <Stat>
        <StatLabel color="secondaryGray.600">{label}</StatLabel>
        <StatNumber fontSize="2xl">{value}</StatNumber>
      </Stat>
    </Box>
  );
}

export default function WalletView() {
  const cardBg = useColorModeValue('white', 'navy.800');
  const headBg = useColorModeValue('secondaryGray.300', 'navy.700');
  const [page, setPage] = useState(1);

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet', 'me'],
    queryFn: walletsService.me,
  });

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['wallet', 'transactions', { page }],
    queryFn: () => walletsService.transactions({ page, limit: 20 }),
    keepPreviousData: true,
  });
  const rows = txData?.data || [];
  const meta = txData?.meta || { total: 0 };
  const currency = wallet?.currency || 'USD';

  return (
    <Box pt={{ base: '120px', md: '80px', xl: '80px' }}>
      <Heading size="lg" mb="24px">
        My Wallet
      </Heading>

      {walletLoading ? (
        <Flex justify="center" p="40px">
          <Spinner />
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing="20px" mb="24px">
          <BalanceCard label="Total balance" value={money(wallet?.totalBalance, currency)} />
          <BalanceCard label="Available" value={money(wallet?.availableBalance, currency)} />
          <BalanceCard label="Pending" value={money(wallet?.pendingBalance, currency)} />
        </SimpleGrid>
      )}

      <Box bg={cardBg} borderRadius="16px" boxShadow="0 4px 18px rgba(112,144,176,0.08)" overflow="hidden">
        <Heading size="md" p="20px" pb="12px">
          Transactions
        </Heading>
        <TableContainer>
          <Table variant="simple">
            <Thead bg={headBg}>
              <Tr>
                <Th>Date</Th>
                <Th>Type</Th>
                <Th isNumeric>Amount</Th>
                <Th isNumeric>Balance after</Th>
                <Th>Note</Th>
              </Tr>
            </Thead>
            <Tbody>
              {txLoading && !rows.length && (
                <Tr>
                  <Td colSpan={5}>
                    <Flex justify="center" p="40px">
                      <Spinner />
                    </Flex>
                  </Td>
                </Tr>
              )}
              {!txLoading && rows.length === 0 && (
                <Tr>
                  <Td colSpan={5}>
                    <Text textAlign="center" color="gray.500" p="32px">
                      No transactions yet
                    </Text>
                  </Td>
                </Tr>
              )}
              {rows.map((t) => (
                <Tr key={t.id}>
                  <Td fontSize="sm">{new Date(t.createdAt).toLocaleString()}</Td>
                  <Td>
                    <Tag size="sm" colorScheme={TX_COLORS[t.type] || 'gray'}>
                      {t.type}
                    </Tag>
                  </Td>
                  <Td isNumeric color={Number(t.amount) < 0 ? 'red.500' : 'green.500'} fontWeight="600">
                    {money(t.amount, t.currency)}
                  </Td>
                  <Td isNumeric>{money(t.balanceAfter, t.currency)}</Td>
                  <Td fontSize="sm" color="gray.500" maxW="240px" isTruncated>
                    {t.note || '—'}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        <Flex p="16px" justify="space-between" align="center">
          <Text color="gray.500" fontSize="sm">
            Showing {rows.length} of {meta.total} transactions
          </Text>
          <HStack>
            <Button size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} isDisabled={page === 1}>
              Prev
            </Button>
            <Text fontSize="sm">Page {page}</Text>
            <Button size="sm" onClick={() => setPage((p) => p + 1)} isDisabled={rows.length < 20}>
              Next
            </Button>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
}
