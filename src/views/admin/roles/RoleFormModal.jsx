import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rolesService } from 'services/roles.service';
import { permissionsService } from 'services/permissions.service';
import { extractApiError } from 'hooks/useApiError';

export default function RoleFormModal({ isOpen, onClose, role }) {
  const isEdit = Boolean(role);
  const qc = useQueryClient();

  const { data: groups } = useQuery({
    queryKey: ['permission-groups'],
    queryFn: () => permissionsService.groups(),
    enabled: isOpen,
  });
  const allGroups = useMemo(() => groups || {}, [groups]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (isOpen) {
      reset({
        name: role?.name || '',
        description: role?.description || '',
        permissionIds: role?.permissions?.map((p) => p.id) || [],
      });
    }
  }, [isOpen, role, reset]);

  const mutate = useMutation({
    mutationFn: (values) =>
      isEdit ? rolesService.update(role.id, values) : rolesService.create(values),
    onSuccess: () => {
      toast.success(isEdit ? 'Role updated' : 'Role created');
      qc.invalidateQueries({ queryKey: ['roles'] });
      onClose();
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{isEdit ? `Edit role: ${role?.name}` : 'Create role'}</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit((v) => mutate.mutate(v))}>
          <ModalBody>
            <Stack spacing="16px">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
                <FormControl isInvalid={!!errors.name} isRequired>
                  <FormLabel>Role name</FormLabel>
                  <Input
                    placeholder="e.g. recovery-provider"
                    {...register('name', { required: 'Required' })}
                  />
                  <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                </FormControl>
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Input {...register('description')} />
                </FormControl>
              </SimpleGrid>

              <Box>
                <Heading size="sm" mb="8px">
                  Permissions
                </Heading>
                <Text fontSize="sm" color="gray.500" mb="12px">
                  Pick the actions this role can perform.
                </Text>

                <Controller
                  control={control}
                  name="permissionIds"
                  render={({ field }) => {
                    const selected = new Set(field.value || []);
                    const toggle = (id, on) => {
                      const next = new Set(selected);
                      if (on) next.add(id);
                      else next.delete(id);
                      field.onChange(Array.from(next));
                    };
                    return (
                      <Stack divider={<Divider />} spacing="12px">
                        {Object.entries(allGroups).map(([group, perms]) => {
                          const groupIds = perms.map((p) => p.id);
                          const allOn = groupIds.every((id) => selected.has(id));
                          return (
                            <Box key={group}>
                              <Checkbox
                                isChecked={allOn}
                                isIndeterminate={!allOn && groupIds.some((id) => selected.has(id))}
                                onChange={(e) => {
                                  const next = new Set(selected);
                                  if (e.target.checked) groupIds.forEach((id) => next.add(id));
                                  else groupIds.forEach((id) => next.delete(id));
                                  field.onChange(Array.from(next));
                                }}
                                fontWeight="600"
                                textTransform="capitalize"
                              >
                                {group}
                              </Checkbox>
                              <SimpleGrid columns={{ base: 1, md: 2 }} spacing="8px" mt="8px" ms="24px">
                                {perms.map((p) => (
                                  <Checkbox
                                    key={p.id}
                                    isChecked={selected.has(p.id)}
                                    onChange={(e) => toggle(p.id, e.target.checked)}
                                  >
                                    <Text fontSize="sm">{p.name}</Text>
                                  </Checkbox>
                                ))}
                              </SimpleGrid>
                            </Box>
                          );
                        })}
                        {!Object.keys(allGroups).length && (
                          <Text color="gray.400">No permissions defined</Text>
                        )}
                      </Stack>
                    );
                  }}
                />
              </Box>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button type="submit" colorScheme="brand" isLoading={isSubmitting || mutate.isPending}>
              {isEdit ? 'Save role' : 'Create role'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
