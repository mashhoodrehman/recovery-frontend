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
  Spinner,
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
import { usersService } from 'services/users.service';
import { extractApiError } from 'hooks/useApiError';
import { useAuth } from 'context/AuthContext';
import UserFormModal from './UserFormModal';

export default function UsersList() {
  const { can } = useAuth();
  const cardBg = useColorModeValue('white', 'navy.800');
  const headBg = useColorModeValue('secondaryGray.300', 'navy.700');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);

  const form = useDisclosure();
  const del = useDisclosure();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const cancelRef = React.useRef();

  const qc = useQueryClient();

  const { data, isFetching, isLoading } = useQuery({
    queryKey: ['users', { page, search }],
    queryFn: () => usersService.list({ page, limit: 20, search }),
    keepPreviousData: true,
  });
  const rows = data?.data || [];
  const meta = data?.meta || { total: 0 };

  const removeMut = useMutation({
    mutationFn: (id) => usersService.remove(id),
    onSuccess: () => {
      toast.success('User deleted');
      qc.invalidateQueries({ queryKey: ['users'] });
      del.onClose();
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const openCreate = () => {
    setEditing(null);
    form.onOpen();
  };
  const openEdit = (u) => {
    setEditing(u);
    form.onOpen();
  };
  const confirmDelete = (u) => {
    setDeleteTarget(u);
    del.onOpen();
  };

  return (
    <Box pt={{ base: '120px', md: '80px', xl: '80px' }}>
      <Flex justify="space-between" align="center" mb="24px" flexWrap="wrap" gap="12px">
        <Heading size="lg">Users</Heading>
        <HStack spacing="12px">
          <InputGroup w={{ base: '100%', md: '280px' }}>
            <InputLeftElement pointerEvents="none">
              <MdSearch />
            </InputLeftElement>
            <Input
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </InputGroup>
          {can('users.create') && (
            <Button leftIcon={<MdAdd />} colorScheme="brand" onClick={openCreate}>
              Add user
            </Button>
          )}
        </HStack>
      </Flex>

      <Box bg={cardBg} borderRadius="16px" boxShadow="0 4px 18px rgba(112,144,176,0.08)" overflow="hidden">
        <TableContainer>
          <Table variant="simple">
            <Thead bg={headBg}>
              <Tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Roles</Th>
                <Th>Status</Th>
                <Th isNumeric>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(isLoading || isFetching) && !rows.length && (
                <Tr>
                  <Td colSpan={5}>
                    <Flex justify="center" p="40px">
                      <Spinner />
                    </Flex>
                  </Td>
                </Tr>
              )}
              {!isLoading && rows.length === 0 && (
                <Tr>
                  <Td colSpan={5}>
                    <Text textAlign="center" color="gray.500" p="32px">
                      No users found
                    </Text>
                  </Td>
                </Tr>
              )}
              {rows.map((u) => (
                <Tr key={u.id}>
                  <Td fontWeight="600">
                    {u.firstName} {u.lastName || ''}
                  </Td>
                  <Td>{u.email}</Td>
                  <Td>
                    <HStack spacing="6px" flexWrap="wrap">
                      {(u.roles || []).map((r) => (
                        <Tag key={r.id} size="sm" colorScheme="blue">
                          {r.name}
                        </Tag>
                      ))}
                    </HStack>
                  </Td>
                  <Td>
                    <Badge colorScheme={u.isActive ? 'green' : 'gray'}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Td>
                  <Td isNumeric>
                    <HStack justify="flex-end">
                      {can('users.update') && (
                        <IconButton
                          aria-label="Edit"
                          icon={<MdEdit />}
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(u)}
                        />
                      )}
                      {can('users.delete') && (
                        <IconButton
                          aria-label="Delete"
                          icon={<MdDelete />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => confirmDelete(u)}
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
            Showing {rows.length} of {meta.total} users
          </Text>
          <HStack>
            <Button size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} isDisabled={page === 1}>
              Prev
            </Button>
            <Text fontSize="sm">Page {page}</Text>
            <Button
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              isDisabled={rows.length < 20}
            >
              Next
            </Button>
          </HStack>
        </Flex>
      </Box>

      <UserFormModal isOpen={form.isOpen} onClose={form.onClose} user={editing} />

      <AlertDialog isOpen={del.isOpen} onClose={del.onClose} leastDestructiveRef={cancelRef} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete user</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete <b>{deleteTarget?.email}</b>? This cannot be undone.
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
