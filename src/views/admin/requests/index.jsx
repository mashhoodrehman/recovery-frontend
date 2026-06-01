import React, { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  IconButton,
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
  useDisclosure,
} from '@chakra-ui/react';
import { MdVisibility } from 'react-icons/md';
import { useQuery } from '@tanstack/react-query';
import { recoveryService } from 'services/recovery.service';
import RequestDetailDrawer from './RequestDetailDrawer';

const STATUS_COLORS = {
  open: 'blue',
  assigned: 'purple',
  in_progress: 'orange',
  completed: 'green',
  cancelled: 'red',
};
const STATUSES = ['open', 'assigned', 'in_progress', 'completed', 'cancelled'];

export default function RequestsList() {
  const cardBg = useColorModeValue('white', 'navy.800');
  const headBg = useColorModeValue('secondaryGray.300', 'navy.700');

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const drawer = useDisclosure();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['requests', { page, status }],
    queryFn: () => recoveryService.list({ page, limit: 20, status: status || undefined }),
    keepPreviousData: true,
  });
  const rows = data?.data || [];
  const meta = data?.meta || { total: 0 };

  const openDetail = (id) => {
    setSelectedId(id);
    drawer.onOpen();
  };

  return (
    <Box pt={{ base: '120px', md: '80px', xl: '80px' }}>
      <Flex justify="space-between" align="center" mb="24px" flexWrap="wrap" gap="12px">
        <Heading size="lg">Service Requests</Heading>
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
                <Th>Requester</Th>
                <Th>Pickup</Th>
                <Th>Bids</Th>
                <Th>Status</Th>
                <Th isNumeric>Actions</Th>
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
                      No requests found
                    </Text>
                  </Td>
                </Tr>
              )}
              {rows.map((r) => (
                <Tr key={r.id}>
                  <Td fontWeight="600">#{r.id}</Td>
                  <Td>
                    {r.requester ? `${r.requester.firstName} ${r.requester.lastName || ''}` : '—'}
                  </Td>
                  <Td maxW="260px" isTruncated>
                    {r.pickupAddress}
                  </Td>
                  <Td>{r.bids?.length || 0}</Td>
                  <Td>
                    <Badge colorScheme={STATUS_COLORS[r.status] || 'gray'}>{r.status}</Badge>
                  </Td>
                  <Td isNumeric>
                    <IconButton
                      aria-label="View"
                      icon={<MdVisibility />}
                      size="sm"
                      variant="ghost"
                      onClick={() => openDetail(r.id)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        <Flex p="16px" justify="space-between" align="center">
          <Text color="gray.500" fontSize="sm">
            Showing {rows.length} of {meta.total} requests
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

      <RequestDetailDrawer isOpen={drawer.isOpen} onClose={drawer.onClose} requestId={selectedId} />
    </Box>
  );
}
