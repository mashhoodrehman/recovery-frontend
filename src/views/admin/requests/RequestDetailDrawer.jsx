import React from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Heading,
  SimpleGrid,
  Spinner,
  Stack,
  Tag,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { recoveryService } from 'services/recovery.service';
import { extractApiError } from 'hooks/useApiError';
import { useAuth } from 'context/AuthContext';

const STATUS_COLORS = {
  open: 'blue',
  assigned: 'purple',
  in_progress: 'orange',
  completed: 'green',
  cancelled: 'red',
};
const BID_COLORS = { pending: 'yellow', accepted: 'green', rejected: 'red', withdrawn: 'gray' };

function Field({ label, value }) {
  return (
    <Box>
      <Text fontSize="xs" color="gray.500" textTransform="uppercase">
        {label}
      </Text>
      <Text fontWeight="500">{value || '—'}</Text>
    </Box>
  );
}

export default function RequestDetailDrawer({ isOpen, onClose, requestId }) {
  const { can } = useAuth();
  const qc = useQueryClient();
  const rowBg = useColorModeValue('secondaryGray.100', 'navy.700');

  const { data: request, isLoading } = useQuery({
    queryKey: ['request', requestId],
    queryFn: () => recoveryService.get(requestId),
    enabled: Boolean(requestId && isOpen),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['request', requestId] });
    qc.invalidateQueries({ queryKey: ['requests'] });
  };

  const onError = (err) => toast.error(extractApiError(err));

  const startMut = useMutation({
    mutationFn: () => recoveryService.start(requestId),
    onSuccess: () => {
      toast.success('Job started');
      invalidate();
    },
    onError,
  });
  const completeMut = useMutation({
    mutationFn: () => recoveryService.complete(requestId),
    onSuccess: () => {
      toast.success('Job completed');
      invalidate();
    },
    onError,
  });
  const cancelMut = useMutation({
    mutationFn: () => recoveryService.cancel(requestId),
    onSuccess: () => {
      toast.success('Request cancelled');
      invalidate();
    },
    onError,
  });
  const acceptBidMut = useMutation({
    mutationFn: (bidId) => recoveryService.acceptBid(requestId, bidId),
    onSuccess: () => {
      toast.success('Bid accepted');
      invalidate();
    },
    onError,
  });

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="md" placement="right">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>
          Request {request ? `#${request.id}` : ''}{' '}
          {request && (
            <Badge ml="8px" colorScheme={STATUS_COLORS[request.status] || 'gray'}>
              {request.status}
            </Badge>
          )}
        </DrawerHeader>
        <DrawerBody>
          {isLoading || !request ? (
            <Flex justify="center" p="40px">
              <Spinner />
            </Flex>
          ) : (
            <Stack spacing="20px">
              <SimpleGrid columns={2} spacing="16px">
                <Field
                  label="Requester"
                  value={
                    request.requester
                      ? `${request.requester.firstName} ${request.requester.lastName || ''}`
                      : '—'
                  }
                />
                <Field label="Phone" value={request.requester?.phone} />
                <Field label="Vehicle type" value={request.vehicleType} />
                <Field label="Plate" value={request.vehiclePlate} />
              </SimpleGrid>

              <Field label="Pickup address" value={request.pickupAddress} />
              {request.dropoffAddress && (
                <Field label="Drop-off address" value={request.dropoffAddress} />
              )}
              {request.issueDescription && (
                <Field label="Issue" value={request.issueDescription} />
              )}
              {request.assignedTo && (
                <Field
                  label="Assigned provider"
                  value={`${request.assignedTo.firstName} ${request.assignedTo.lastName || ''}`}
                />
              )}

              <HStack>
                {request.status === 'assigned' && can('recovery.assign', 'recovery.complete') && (
                  <Button size="sm" colorScheme="orange" onClick={() => startMut.mutate()} isLoading={startMut.isPending}>
                    Mark in progress
                  </Button>
                )}
                {['assigned', 'in_progress'].includes(request.status) && can('recovery.complete') && (
                  <Button size="sm" colorScheme="green" onClick={() => completeMut.mutate()} isLoading={completeMut.isPending}>
                    Complete
                  </Button>
                )}
                {['open', 'assigned'].includes(request.status) && can('recovery.request.cancel.own') && (
                  <Button size="sm" colorScheme="red" variant="outline" onClick={() => cancelMut.mutate()} isLoading={cancelMut.isPending}>
                    Cancel
                  </Button>
                )}
              </HStack>

              <Divider />

              <Heading size="sm">Bids ({request.bids?.length || 0})</Heading>
              <Stack spacing="10px">
                {(request.bids || []).length === 0 && (
                  <Text color="gray.500" fontSize="sm">
                    No bids yet
                  </Text>
                )}
                {(request.bids || []).map((b) => (
                  <Flex key={b.id} bg={rowBg} p="12px" borderRadius="10px" justify="space-between" align="center">
                    <Box>
                      <Text fontWeight="600">
                        {b.currency} {b.amount}{' '}
                        <Tag size="sm" ml="6px" colorScheme={BID_COLORS[b.status] || 'gray'}>
                          {b.status}
                        </Tag>
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {b.bidder ? `${b.bidder.firstName} ${b.bidder.lastName || ''}` : 'Provider'}
                        {b.etaMinutes ? ` · ETA ${b.etaMinutes}m` : ''}
                      </Text>
                      {b.note && (
                        <Text fontSize="sm" color="gray.500">
                          {b.note}
                        </Text>
                      )}
                    </Box>
                    {request.status === 'open' && b.status === 'pending' && can('recovery.bid.accept') && (
                      <Button
                        size="xs"
                        colorScheme="green"
                        onClick={() => acceptBidMut.mutate(b.id)}
                        isLoading={acceptBidMut.isPending}
                      >
                        Accept
                      </Button>
                    )}
                  </Flex>
                ))}
              </Stack>
            </Stack>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
