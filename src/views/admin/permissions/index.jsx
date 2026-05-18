import React, { useState } from 'react';
import {
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
import { permissionsService } from 'services/permissions.service';
import { extractApiError } from 'hooks/useApiError';
import { useAuth } from 'context/AuthContext';
import PermissionFormModal from './PermissionFormModal';

export default function PermissionsList() {
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
    queryKey: ['permissions'],
    queryFn: () => permissionsService.list({ page: 1, limit: 200 }),
  });
  const rows = data?.data || [];

  const removeMut = useMutation({
    mutationFn: (id) => permissionsService.remove(id),
    onSuccess: () => {
      toast.success('Permission deleted');
      qc.invalidateQueries({ queryKey: ['permissions'] });
      qc.invalidateQueries({ queryKey: ['permission-groups'] });
      del.onClose();
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  return (
    <Box pt={{ base: '120px', md: '80px', xl: '80px' }}>
      <Flex justify="space-between" align="center" mb="24px">
        <Heading size="lg">Permissions</Heading>
        {can('permissions.create') && (
          <Button
            leftIcon={<MdAdd />}
            colorScheme="brand"
            onClick={() => {
              setEditing(null);
              form.onOpen();
            }}
          >
            Add permission
          </Button>
        )}
      </Flex>

      <Box bg={cardBg} borderRadius="16px" boxShadow="0 4px 18px rgba(112,144,176,0.08)" overflow="hidden">
        <TableContainer>
          <Table variant="simple">
            <Thead bg={headBg}>
              <Tr>
                <Th>Name</Th>
                <Th>Group</Th>
                <Th>Description</Th>
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
                      No permissions defined
                    </Text>
                  </Td>
                </Tr>
              )}
              {rows.map((p) => (
                <Tr key={p.id}>
                  <Td fontFamily="mono" fontSize="sm">
                    {p.name}
                  </Td>
                  <Td>
                    {p.group ? (
                      <Tag size="sm" colorScheme="blue">
                        {p.group}
                      </Tag>
                    ) : (
                      <Text color="gray.400">—</Text>
                    )}
                  </Td>
                  <Td>{p.description || '—'}</Td>
                  <Td isNumeric>
                    <HStack justify="flex-end">
                      {can('permissions.update') && (
                        <IconButton
                          aria-label="Edit"
                          icon={<MdEdit />}
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditing(p);
                            form.onOpen();
                          }}
                        />
                      )}
                      {can('permissions.delete') && (
                        <IconButton
                          aria-label="Delete"
                          icon={<MdDelete />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => {
                            setDeleteTarget(p);
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

      <PermissionFormModal isOpen={form.isOpen} onClose={form.onClose} permission={editing} />

      <AlertDialog isOpen={del.isOpen} onClose={del.onClose} leastDestructiveRef={cancelRef} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete permission</AlertDialogHeader>
            <AlertDialogBody>
              Delete <b>{deleteTarget?.name}</b>? Roles using it will lose access.
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
