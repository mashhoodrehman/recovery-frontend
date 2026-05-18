import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
  Stack,
} from '@chakra-ui/react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionsService } from 'services/permissions.service';
import { extractApiError } from 'hooks/useApiError';

export default function PermissionFormModal({ isOpen, onClose, permission }) {
  const isEdit = Boolean(permission);
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (isOpen) {
      reset({
        name: permission?.name || '',
        group: permission?.group || '',
        description: permission?.description || '',
      });
    }
  }, [isOpen, permission, reset]);

  const mutate = useMutation({
    mutationFn: (values) =>
      isEdit
        ? permissionsService.update(permission.id, values)
        : permissionsService.create(values),
    onSuccess: () => {
      toast.success(isEdit ? 'Permission updated' : 'Permission created');
      qc.invalidateQueries({ queryKey: ['permissions'] });
      qc.invalidateQueries({ queryKey: ['permission-groups'] });
      onClose();
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{isEdit ? 'Edit permission' : 'Create permission'}</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit((v) => mutate.mutate(v))}>
          <ModalBody>
            <Stack spacing="16px">
              <FormControl isInvalid={!!errors.name} isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  placeholder="e.g. recovery.bid.create"
                  {...register('name', { required: 'Required' })}
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel>Group</FormLabel>
                <Input placeholder="e.g. recovery" {...register('group')} />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input {...register('description')} />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button type="submit" colorScheme="brand" isLoading={isSubmitting || mutate.isPending}>
              {isEdit ? 'Save' : 'Create'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
