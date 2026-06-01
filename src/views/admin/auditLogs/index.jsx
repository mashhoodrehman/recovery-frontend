import React, { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
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
import { useQuery } from '@tanstack/react-query';
import { auditLogsService } from 'services/recovery.service';

const METHOD_COLORS = { POST: 'green', PUT: 'blue', PATCH: 'blue', DELETE: 'red' };

export default function AuditLogsView() {
  const cardBg = useColorModeValue('white', 'navy.800');
  const headBg = useColorModeValue('secondaryGray.300', 'navy.700');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['audit-logs', { page }],
    queryFn: () => auditLogsService.list({ page, limit: 30 }),
    keepPreviousData: true,
  });
  const rows = data?.data || [];
  const meta = data?.meta || { total: 0 };

  return (
    <Box pt={{ base: '120px', md: '80px', xl: '80px' }}>
      <Heading size="lg" mb="24px">
        Audit Logs
      </Heading>

      <Box bg={cardBg} borderRadius="16px" boxShadow="0 4px 18px rgba(112,144,176,0.08)" overflow="hidden">
        <TableContainer>
          <Table variant="simple">
            <Thead bg={headBg}>
              <Tr>
                <Th>When</Th>
                <Th>User</Th>
                <Th>Method</Th>
                <Th>Entity</Th>
                <Th>Path</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(isLoading || isFetching) && !rows.length && (
                <Tr>
                  <Td colSpan={6}>
                    <Flex justify="center" p="40px">
                      <Spinner />
                    </Flex>
                  </Td>
                </Tr>
              )}
              {!isLoading && rows.length === 0 && (
                <Tr>
                  <Td colSpan={6}>
                    <Text textAlign="center" color="gray.500" p="32px">
                      No activity recorded yet
                    </Text>
                  </Td>
                </Tr>
              )}
              {rows.map((log) => (
                <Tr key={log.id}>
                  <Td fontSize="sm">{new Date(log.createdAt).toLocaleString()}</Td>
                  <Td>{log.user ? `${log.user.firstName} ${log.user.lastName || ''}` : 'System'}</Td>
                  <Td>
                    <Badge colorScheme={METHOD_COLORS[log.method] || 'gray'}>{log.method}</Badge>
                  </Td>
                  <Td>{log.entity || '—'}</Td>
                  <Td fontSize="sm" color="gray.500" maxW="260px" isTruncated>
                    {log.path}
                  </Td>
                  <Td>{log.statusCode}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        <Flex p="16px" justify="space-between" align="center">
          <Text color="gray.500" fontSize="sm">
            Showing {rows.length} of {meta.total} entries
          </Text>
          <HStack>
            <Button size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} isDisabled={page === 1}>
              Prev
            </Button>
            <Text fontSize="sm">Page {page}</Text>
            <Button size="sm" onClick={() => setPage((p) => p + 1)} isDisabled={rows.length < 30}>
              Next
            </Button>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
}
