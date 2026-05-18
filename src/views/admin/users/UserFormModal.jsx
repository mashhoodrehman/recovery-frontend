import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
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
  Switch,
  Wrap,
  WrapItem,
  Checkbox,
  Box,
  Text,
} from '@chakra-ui/react';
import toast from 'react-hot-toast';
import { usersService } from 'services/users.service';
import { rolesService } from 'services/roles.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extractApiError } from 'hooks/useApiError';

export default function UserFormModal({ isOpen, onClose, user }) {
  const isEdit = Boolean(user);
  const qc = useQueryClient();

  const { data: rolesData } = useQuery({
    queryKey: ['roles', { limit: 100 }],
    queryFn: () => rolesService.list({ limit: 100, page: 1 }),
    enabled: isOpen,
  });
  const roles = rolesData?.data || [];

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
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        password: '',
        isActive: user?.isActive ?? true,
        roleIds: user?.roles?.map((r) => r.id) || [],
      });
    }
  }, [isOpen, user, reset]);

  const mutate = useMutation({
    mutationFn: (values) => {
      const payload = { ...values };
      if (isEdit && !payload.password) delete payload.password;
      return isEdit ? usersService.update(user.id, payload) : usersService.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'User updated' : 'User created');
      qc.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{isEdit ? 'Edit user' : 'Create user'}</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit((v) => mutate.mutate(v))}>
          <ModalBody>
            <Stack spacing="16px">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
                <FormControl isInvalid={!!errors.firstName} isRequired>
                  <FormLabel>First name</FormLabel>
                  <Input {...register('firstName', { required: 'Required' })} />
                  <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
                </FormControl>
                <FormControl>
                  <FormLabel>Last name</FormLabel>
                  <Input {...register('lastName')} />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
                <FormControl isInvalid={!!errors.email} isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    {...register('email', {
                      required: 'Required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                    })}
                  />
                  <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                </FormControl>
                <FormControl>
                  <FormLabel>Phone</FormLabel>
                  <Input {...register('phone')} />
                </FormControl>
              </SimpleGrid>

              <FormControl isInvalid={!!errors.password} isRequired={!isEdit}>
                <FormLabel>{isEdit ? 'New password (leave blank to keep)' : 'Password'}</FormLabel>
                <Input
                  type="password"
                  {...register('password', {
                    ...(isEdit ? {} : { required: 'Required' }),
                    minLength: { value: 8, message: 'Min 8 characters' },
                  })}
                />
                <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
              </FormControl>

              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Active</FormLabel>
                    <Switch isChecked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />
                  </FormControl>
                )}
              />

              <Box>
                <FormLabel mb="8px">Roles</FormLabel>
                <Controller
                  control={control}
                  name="roleIds"
                  render={({ field }) => (
                    <Wrap spacing="10px">
                      {roles.map((r) => {
                        const checked = (field.value || []).includes(r.id);
                        return (
                          <WrapItem key={r.id}>
                            <Checkbox
                              isChecked={checked}
                              onChange={(e) => {
                                const next = new Set(field.value || []);
                                if (e.target.checked) next.add(r.id);
                                else next.delete(r.id);
                                field.onChange(Array.from(next));
                              }}
                            >
                              {r.name}
                            </Checkbox>
                          </WrapItem>
                        );
                      })}
                      {!roles.length && <Text color="gray.400">No roles available</Text>}
                    </Wrap>
                  )}
                />
              </Box>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button type="submit" colorScheme="brand" isLoading={isSubmitting || mutate.isPending}>
              {isEdit ? 'Save changes' : 'Create user'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
