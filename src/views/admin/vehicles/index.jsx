import React, { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
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
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete, MdSearch } from 'react-icons/md';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { vehiclesService, VEHICLE_TYPES } from 'services/vehicles.service';
import { extractApiError } from 'hooks/useApiError';
import { useAuth } from 'context/AuthContext';
import VehicleFormModal from './VehicleFormModal';

const typeLabel = (v) => VEHICLE_TYPES.find((t) => t.value === v)?.label || v;
const availabilityColor = { available: 'green', busy: 'orange', offline: 'gray' };
const statusColor = { active: 'green', inactive: 'gray', maintenance: 'orange' };

export default function VehiclesList() {
  const { can } = useAuth();
  const cardBg = useColorModeValue('white', 'navy.800');
  const headBg = useColorModeValue('secondaryGray.300', 'navy.700');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [editing, setEditing] = useState(null);

  const form = useDisclosure();
  const del = useDisclosure();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const cancelRef = React.useRef();
  const qc = useQueryClient();

  const { data, isFetching, isLoading } = useQuery({
    queryKey: ['vehicles', { page, search, vehicleType }],
    queryFn: () => vehiclesService.list({ page, limit: 20, search, vehicleType: vehicleType || undefined }),
    keepPreviousData: true,
  });
  const rows = data?.data || [];
  const meta = data?.meta || { total: 0 };

  const removeMut = useMutation({
    mutationFn: (id) => vehiclesService.remove(id),
    onSuccess: () => {
      toast.success('Vehicle deleted');
      qc.invalidateQueries({ queryKey: ['vehicles'] });
      del.onClose();
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const openCreate = () => {
    setEditing(null);
    form.onOpen();
  };
  const openEdit = (v) => {
    setEditing(v);
    form.onOpen();
  };
  const confirmDelete = (v) => {
    setDeleteTarget(v);
    del.onOpen();
  };

  return (
    <Box pt={{ base: '120px', md: '80px', xl: '80px' }}>
      <Flex justify="space-between" align="center" mb="24px" flexWrap="wrap" gap="12px">
        <Heading size="lg">Vehicles</Heading>
        <HStack spacing="12px" flexWrap="wrap">
          <InputGroup w={{ base: '100%', md: '240px' }}>
            <InputLeftElement pointerEvents="none">
              <MdSearch />
            </InputLeftElement>
            <Input
              placeholder="Search plate or model"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </InputGroup>
          <Select
            w={{ base: '100%', md: '200px' }}
            placeholder="All types"
            value={vehicleType}
            onChange={(e) => {
              setPage(1);
              setVehicleType(e.target.value);
            }}
          >
            {VEHICLE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
          {can('vehicles.create', 'vehicles.manage.any') && (
            <Button leftIcon={<MdAdd />} colorScheme="brand" onClick={openCreate}>
              Add vehicle
            </Button>
          )}
        </HStack>
      </Flex>

      <Box bg={cardBg} borderRadius="16px" boxShadow="0 4px 18px rgba(112,144,176,0.08)" overflow="hidden">
        <TableContainer>
          <Table variant="simple">
            <Thead bg={headBg}>
              <Tr>
                <Th>Plate</Th>
                <Th>Type</Th>
                <Th>Model / Year</Th>
                <Th>Owner</Th>
                <Th>Status</Th>
                <Th>Availability</Th>
                <Th isNumeric>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(isLoading || isFetching) && !rows.length && (
                <Tr>
                  <Td colSpan={7}>
                    <Flex justify="center" p="40px">
                      <Spinner />
                    </Flex>
                  </Td>
                </Tr>
              )}
              {!isLoading && rows.length === 0 && (
                <Tr>
                  <Td colSpan={7}>
                    <Text textAlign="center" color="gray.500" p="32px">
                      No vehicles found
                    </Text>
                  </Td>
                </Tr>
              )}
              {rows.map((v) => (
                <Tr key={v.id}>
                  <Td fontWeight="600">{v.plateNumber}</Td>
                  <Td>{typeLabel(v.vehicleType)}</Td>
                  <Td>
                    {v.model || '—'} {v.year ? `(${v.year})` : ''}
                  </Td>
                  <Td>{v.owner ? `${v.owner.firstName} ${v.owner.lastName || ''}` : '—'}</Td>
                  <Td>
                    <Badge colorScheme={statusColor[v.status] || 'gray'}>{v.status}</Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={availabilityColor[v.availability] || 'gray'}>
                      {v.availability}
                    </Badge>
                  </Td>
                  <Td isNumeric>
                    <HStack justify="flex-end">
                      {can('vehicles.update', 'vehicles.manage.any') && (
                        <IconButton
                          aria-label="Edit"
                          icon={<MdEdit />}
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(v)}
                        />
                      )}
                      {can('vehicles.delete', 'vehicles.manage.any') && (
                        <IconButton
                          aria-label="Delete"
                          icon={<MdDelete />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => confirmDelete(v)}
                        />
                      )}
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        <Flex p="16px" justify="space-between" align="center">
          <Text color="gray.500" fontSize="sm">
            Showing {rows.length} of {meta.total} vehicles
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

      <VehicleFormModal isOpen={form.isOpen} onClose={form.onClose} vehicle={editing} />

      <AlertDialog isOpen={del.isOpen} onClose={del.onClose} leastDestructiveRef={cancelRef} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete vehicle</AlertDialogHeader>
            <AlertDialogBody>
              Delete vehicle <b>{deleteTarget?.plateNumber}</b>? This cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={del.onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                ml={3}
                onClick={() => removeMut.mutate(deleteTarget.id)}
                isLoading={removeMut.isPending}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
