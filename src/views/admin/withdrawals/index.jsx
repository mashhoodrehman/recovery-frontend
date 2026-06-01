import React, { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Select,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { withdrawalsService } from 'services/withdrawals.service';
import { extractApiError } from 'hooks/useApiError';
import { useAuth } from 'context/AuthContext';

const STATUS_COLORS = { pending: 'yellow', approved: 'blue', rejected: 'red', paid: 'green' };
const STATUSES = ['pending', 'approved', 'rejected', 'paid'];
const money = (n, c = 'USD') => `${c} ${Number(n || 0).toFixed(2)}`;

export default function WithdrawalsList() {
  const { can } = useAuth();
  const cardBg = useColorModeValue('white', 'navy.800');
  const headBg = useColorModeValue('secondaryGray.300', 'navy.700');
  const manage = can('withdrawals.manage');

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const qc = useQueryClient();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['withdrawals', { page, status }],
    queryFn: () => withdrawalsService.list({ page, limit: 20, status: status || undefined }),
    keepPreviousData: true,
  });
  const rows = data?.data || [];
  const meta = data?.meta || { total: 0 };

  const makeAction = (msg) => ({
    onSuccess: () => {
      toast.success(msg);
      qc.invalidateQueries({ queryKey: ['withdrawals'] });
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const approveMut = useMutation({
    mutationFn: (id) => withdrawalsService.approve(id),
    ...makeAction('Withdrawal approved'),
  });
  const paidMut = useMutation({
    mutationFn: (id) => withdrawalsService.markPaid(id),
    ...makeAction('Marked as paid'),
  });
  const rejectMut = useMutation({
    mutationFn: (id) => withdrawalsService.reject(id, {}),
    ...makeAction('Withdrawal rejected'),
  });

  return (
    <Box pt={{ base: '120px', md: '80px', xl: '80px' }}>
      <Flex justify="space-between" align="center" mb="24px" flexWrap="wrap" gap="12px">
        <Heading size="lg">Withdrawals</Heading>
        <Select
          w={{ base: '100%', md: '220px' }}
          placeholder="All statuses"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </Flex>

      <Box bg={cardBg} borderRadius="16px" boxShadow="0 4px 18px rgba(112,144,176,0.08)" overflow="hidden">
        <TableContainer>
          <Table variant="simple">
            <Thead bg={headBg}>
              <Tr>
                <Th>#</Th>
                <Th>Vendor</Th>
                <Th>Amount</Th>
                <Th>Method</Th>
                <Th>Status</Th>
                {manage && <Th isNumeric>Actions</Th>}
              </Tr>
            </Thead>
            <Tbody>
              {(isLoading || isFetching) && !rows.length && (
                <Tr>
                  <Td colSpan={manage ? 6 : 5}>
                    <Flex justify="center" p="40px">
                      <Spinner />
                    </Flex>
                  </Td>
                </Tr>
              )}
              {!isLoading && rows.length === 0 && (
                <Tr>
                  <Td colSpan={manage ? 6 : 5}>
                    <Text textAlign="center" color="gray.500" p="32px">
                      No withdrawals found
                    </Text>
                  </Td>
                </Tr>
              )}
              {rows.map((w) => (
                <Tr key={w.id}>
                  <Td fontWeight="600">#{w.id}</Td>
                  <Td>{w.user ? `${w.user.firstName} ${w.user.lastName || ''}` : '—'}</Td>
                  <Td fontWeight="600">{money(w.amount, w.currency)}</Td>
                  <Td>{w.method}</Td>
                  <Td>
                    <Badge colorScheme={STATUS_COLORS[w.status] || 'gray'}>{w.status}</Badge>
                  </Td>
                  {manage && (
                    <Td isNumeric>
                      <HStack justify="flex-end" spacing="6px">
                        {w.status === 'pending' && (
                          <Button size="xs" colorScheme="blue" onClick={() => approveMut.mutate(w.id)}>
                            Approve
                          </Button>
                        )}
                        {['pending', 'approved'].includes(w.status) && (
                          <>
                            <Button size="xs" colorScheme="green" onClick={() => paidMut.mutate(w.id)}>
                              Mark paid
                            </Button>
                            <Button size="xs" colorScheme="red" variant="outline" onClick={() => rejectMut.mutate(w.id)}>
                              Reject
                            </Button>
                          </>
                        )}
                      </HStack>
                    </Td>
                  )}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        <Flex p="16px" justify="space-between" align="center">
          <Text color="gray.500" fontSize="sm">
            Showing {rows.length} of {meta.total} withdrawals
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
