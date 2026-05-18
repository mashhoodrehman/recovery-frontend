import React, { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  IconButton,
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
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { rolesService } from 'services/roles.service';
import { extractApiError } from 'hooks/useApiError';
import { useAuth } from 'context/AuthContext';
import RoleFormModal from './RoleFormModal';

export default function RolesList() {
  const { can } = useAuth();
  const cardBg = useColorModeValue('white', 'navy.800');
  const headBg = useColorModeValue('secondaryGray.300', 'navy.700');

  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const form = useDisclosure();
  const del = useDisclosure();
  const cancelRef = React.useRef();

  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesService.list({ page: 1, limit: 100 }),
  });
  const rows = data?.data || [];

  const removeMut = useMutation({
    mutationFn: (id) => rolesService.remove(id),
    onSuccess: () => {
      toast.success('Role deleted');
      qc.invalidateQueries({ queryKey: ['roles'] });
      del.onClose();
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const openCreate = () => {
    setEditing(null);
    form.onOpen();
  };
  const openEdit = (r) => {
    setEditing(r);
    form.onOpen();
  };

  return (
    <Box pt={{ base: '120px', md: '80px', xl: '80px' }}>
      <Flex justify="space-between" align="center" mb="24px">
        <Heading size="lg">Roles</Heading>
        {can('roles.create') && (
          <Button leftIcon={<MdAdd />} colorScheme="brand" onClick={openCreate}>
            Add role
          </Button>
        )}
      </Flex>

      <Box bg={cardBg} borderRadius="16px" boxShadow="0 4px 18px rgba(112,144,176,0.08)" overflow="hidden">
        <TableContainer>
          <Table variant="simple">
            <Thead bg={headBg}>
              <Tr>
                <Th>Name</Th>
                <Th>Description</Th>
                <Th>Permissions</Th>
                <Th isNumeric>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading && (
                <Tr>
                  <Td colSpan={4}>
                    <Flex justify="center" p="40px">
                      <Spinner />
                    </Flex>
                  </Td>
                </Tr>
              )}
              {!isLoading && rows.length === 0 && (
                <Tr>
                  <Td colSpan={4}>
                    <Text textAlign="center" color="gray.500" p="32px">
                      No roles defined
                    </Text>
                  </Td>
                </Tr>
              )}
              {rows.map((r) => (
                <Tr key={r.id}>
                  <Td fontWeight="600">
                    {r.name}
                    {r.name === 'super-admin' && (
                      <Badge ml="6px" colorScheme="purple">
                        protected
                      </Badge>
                    )}
                  </Td>
                  <Td>{r.description || '—'}</Td>
                  <Td>
                    <HStack spacing="6px" flexWrap="wrap">
                      {(r.permissions || []).slice(0, 5).map((p) => (
                        <Tag key={p.id} size="sm">
                          {p.name}
                        </Tag>
                      ))}
                      {(r.permissions || []).length > 5 && (
                        <Tag size="sm" colorScheme="gray">
                          +{r.permissions.length - 5} more
                        </Tag>
                      )}
                    </HStack>
                  </Td>
                  <Td isNumeric>
                    <HStack justify="flex-end">
                      {can('roles.update') && (
                        <IconButton
                          aria-label="Edit"
                          icon={<MdEdit />}
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(r)}
                        />
                      )}
                      {can('roles.delete') && r.name !== 'super-admin' && (
                        <IconButton
                          aria-label="Delete"
                          icon={<MdDelete />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => {
                            setDeleteTarget(r);
                            del.onOpen();
                          }}
                        />
                      )}
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      <RoleFormModal isOpen={form.isOpen} onClose={form.onClose} role={editing} />

      <AlertDialog isOpen={del.isOpen} onClose={del.onClose} leastDestructiveRef={cancelRef} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete role</AlertDialogHeader>
            <AlertDialogBody>
              Delete the <b>{deleteTarget?.name}</b> role? Users assigned to it will lose those
              permissions.
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
