import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  HStack,
  Heading,
  Input,
  Stack,
  Spinner,
  Tag,
  Text,
  Textarea,
  useColorModeValue,
} from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { notificationsService } from 'services/notifications.service';
import { extractApiError } from 'hooks/useApiError';
import { useAuth } from 'context/AuthContext';

function ComposePanel() {
  const cardBg = useColorModeValue('white', 'navy.800');
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: { title: '', body: '', broadcast: true, userIds: '' },
  });
  const broadcast = watch('broadcast');

  const sendMut = useMutation({
    mutationFn: (payload) => notificationsService.send(payload),
    onSuccess: (res) => {
      toast.success('Notification sent');
      reset({ title: '', body: '', broadcast: true, userIds: '' });
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const onSubmit = (values) => {
    const payload = { title: values.title, body: values.body };
    if (values.broadcast) {
      payload.broadcast = true;
    } else {
      payload.userIds = values.userIds
        .split(',')
        .map((s) => Number(s.trim()))
        .filter(Boolean);
    }
    sendMut.mutate(payload);
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      bg={cardBg}
      p="24px"
      borderRadius="16px"
      boxShadow="0 4px 18px rgba(112,144,176,0.08)"
      mb="24px"
    >
      <Heading size="md" mb="16px">
        Send notification
      </Heading>
      <Stack spacing="12px">
        <Input placeholder="Title" {...register('title', { required: true })} />
        <Textarea placeholder="Message body" {...register('body')} />
        <Checkbox {...register('broadcast')}>Send to all users (broadcast)</Checkbox>
        {!broadcast && (
          <Input placeholder="User IDs, comma-separated (e.g. 1,2,3)" {...register('userIds')} />
        )}
        <Flex justify="flex-end">
          <Button colorScheme="brand" type="submit" isLoading={sendMut.isPending}>
            Send
          </Button>
        </Flex>
      </Stack>
    </Box>
  );
}

export default function NotificationsView() {
  const { can } = useAuth();
  const cardBg = useColorModeValue('white', 'navy.800');
  const rowBg = useColorModeValue('secondaryGray.100', 'navy.700');
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', { page }],
    queryFn: () => notificationsService.list({ page, limit: 20 }),
    keepPreviousData: true,
  });
  const rows = data?.data || [];
  const meta = data?.meta || { total: 0, unreadCount: 0 };

  const readAllMut = useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
  const readMut = useMutation({
    mutationFn: (id) => notificationsService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <Box pt={{ base: '120px', md: '80px', xl: '80px' }}>
      <Flex justify="space-between" align="center" mb="24px" flexWrap="wrap" gap="12px">
        <Heading size="lg">
          Notifications{' '}
          {meta.unreadCount > 0 && (
            <Tag colorScheme="red" ml="8px">
              {meta.unreadCount} unread
            </Tag>
          )}
        </Heading>
        <Button size="sm" variant="outline" onClick={() => readAllMut.mutate()} isLoading={readAllMut.isPending}>
          Mark all read
        </Button>
      </Flex>

      {can('notifications.send') && <ComposePanel />}

      <Box bg={cardBg} p="16px" borderRadius="16px" boxShadow="0 4px 18px rgba(112,144,176,0.08)">
        {isLoading ? (
          <Flex justify="center" p="40px">
            <Spinner />
          </Flex>
        ) : rows.length === 0 ? (
          <Text textAlign="center" color="gray.500" p="32px">
            No notifications
          </Text>
        ) : (
          <Stack spacing="10px">
            {rows.map((n) => (
              <Flex
                key={n.id}
                bg={n.readAt ? 'transparent' : rowBg}
                p="14px"
                borderRadius="10px"
                justify="space-between"
                align="center"
                borderWidth={n.readAt ? '1px' : '0'}
                borderColor="secondaryGray.200"
                cursor={n.readAt ? 'default' : 'pointer'}
                onClick={() => !n.readAt && readMut.mutate(n.id)}
              >
                <Box>
                  <Text fontWeight="600">{n.title}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {n.body}
                  </Text>
                  <Text fontSize="xs" color="gray.400" mt="2px">
                    {new Date(n.createdAt).toLocaleString()} · {n.type}
                  </Text>
                </Box>
                {!n.readAt && <Tag size="sm" colorScheme="red">new</Tag>}
              </Flex>
            ))}
          </Stack>
        )}

        <Flex p="12px" justify="space-between" align="center">
          <Text color="gray.500" fontSize="sm">
            Showing {rows.length} of {meta.total}
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
    </Box>
  );
}
