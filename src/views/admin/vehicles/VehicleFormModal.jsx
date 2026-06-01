import React, { useEffect } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { vehiclesService, VEHICLE_TYPES } from 'services/vehicles.service';
import { extractApiError } from 'hooks/useApiError';

const EMPTY = {
  vehicleType: 'tow_truck',
  plateNumber: '',
  model: '',
  year: '',
  capacity: '',
  towingCapacity: '',
  status: 'active',
  availability: 'available',
};

export default function VehicleFormModal({ isOpen, onClose, vehicle }) {
  const isEdit = Boolean(vehicle);
  const qc = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: EMPTY });

  useEffect(() => {
    if (isOpen) {
      reset(
        vehicle
          ? {
              vehicleType: vehicle.vehicleType,
              plateNumber: vehicle.plateNumber,
              model: vehicle.model || '',
              year: vehicle.year || '',
              capacity: vehicle.capacity || '',
              towingCapacity: vehicle.towingCapacity || '',
              status: vehicle.status,
              availability: vehicle.availability,
            }
          : EMPTY
      );
    }
  }, [isOpen, vehicle, reset]);

  const mutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? vehiclesService.update(vehicle.id, payload) : vehiclesService.create(payload),
    onSuccess: () => {
      toast.success(isEdit ? 'Vehicle updated' : 'Vehicle created');
      qc.invalidateQueries({ queryKey: ['vehicles'] });
      onClose();
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const onSubmit = (values) => {
    const payload = {
      ...values,
      year: values.year ? Number(values.year) : null,
      capacity: values.capacity ? Number(values.capacity) : null,
      towingCapacity: values.towingCapacity ? Number(values.towingCapacity) : null,
      model: values.model || null,
    };
    mutation.mutate(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>{isEdit ? 'Edit vehicle' : 'Add vehicle'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="16px">
            <GridItem>
              <FormControl isRequired>
                <FormLabel>Vehicle type</FormLabel>
                <Select {...register('vehicleType', { required: true })}>
                  {VEHICLE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </GridItem>
            <GridItem>
              <FormControl isRequired isInvalid={errors.plateNumber}>
                <FormLabel>Plate number</FormLabel>
                <Input {...register('plateNumber', { required: true })} placeholder="ABC-1234" />
              </FormControl>
            </GridItem>
            <GridItem>
              <FormControl>
                <FormLabel>Model</FormLabel>
                <Input {...register('model')} placeholder="e.g. Ford F-550" />
              </FormControl>
            </GridItem>
            <GridItem>
              <FormControl>
                <FormLabel>Year</FormLabel>
                <Input type="number" {...register('year')} placeholder="2022" />
              </FormControl>
            </GridItem>
            <GridItem>
              <FormControl>
                <FormLabel>Capacity (tons)</FormLabel>
                <Input type="number" step="0.1" {...register('capacity')} />
              </FormControl>
            </GridItem>
            <GridItem>
              <FormControl>
                <FormLabel>Towing capacity (tons)</FormLabel>
                <Input type="number" step="0.1" {...register('towingCapacity')} />
              </FormControl>
            </GridItem>
            <GridItem>
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select {...register('status')}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </Select>
              </FormControl>
            </GridItem>
            <GridItem>
              <FormControl>
                <FormLabel>Availability</FormLabel>
                <Select {...register('availability')}>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </Select>
              </FormControl>
            </GridItem>
          </Grid>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="brand" type="submit" isLoading={mutation.isPending}>
            {isEdit ? 'Save changes' : 'Create'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
