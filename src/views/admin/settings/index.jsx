import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Spinner,
  Switch,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { settingsService } from 'services/settings.service';
import { extractApiError } from 'hooks/useApiError';

export default function SettingsView() {
  const cardBg = useColorModeValue('white', 'navy.800');
  const qc = useQueryClient();
  const [values, setValues] = useState({});

  const { data: grouped, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.list,
  });

  // Flatten into a { key: value } edit map once loaded
  const flat = useMemo(() => {
    const map = {};
    Object.values(grouped || {}).forEach((items) =>
      items.forEach((s) => {
        map[s.key] = s.value;
      })
    );
    return map;
  }, [grouped]);

  useEffect(() => {
    setValues(flat);
  }, [flat]);

  const saveMut = useMutation({
    mutationFn: (settings) => settingsService.update(settings),
    onSuccess: () => {
      toast.success('Settings saved');
      qc.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const handleSave = () => {
    const settings = Object.entries(values).map(([key, value]) => ({ key, value }));
    saveMut.mutate(settings);
  };

  if (isLoading) {
    return (
      <Flex justify="center" pt="160px">
        <Spinner size="lg" />
      </Flex>
    );
  }

  return (
    <Box pt={{ base: '120px', md: '80px', xl: '80px' }}>
      <Flex justify="space-between" align="center" mb="24px">
        <Heading size="lg">Settings</Heading>
        <Button colorScheme="brand" onClick={handleSave} isLoading={saveMut.isPending}>
          Save changes
        </Button>
      </Flex>

      {Object.entries(grouped || {}).map(([group, items]) => (
        <Box
          key={group}
          bg={cardBg}
          p="24px"
          borderRadius="16px"
          boxShadow="0 4px 18px rgba(112,144,176,0.08)"
          mb="20px"
        >
          <Heading size="md" mb="16px" textTransform="capitalize">
            {group}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
            {items.map((s) => (
              <FormControl key={s.key} display="flex" flexDir={s.type === 'boolean' ? 'row' : 'column'} alignItems={s.type === 'boolean' ? 'center' : 'stretch'} justifyContent="space-between">
                <FormLabel mb={s.type === 'boolean' ? 0 : '8px'}>{s.label || s.key}</FormLabel>
                {s.type === 'boolean' ? (
                  <Switch
                    isChecked={Boolean(values[s.key])}
                    onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.checked }))}
                  />
                ) : (
                  <Input
                    type={s.type === 'number' ? 'number' : 'text'}
                    value={values[s.key] ?? ''}
                    onChange={(e) =>
                      setValues((v) => ({
                        ...v,
                        [s.key]: s.type === 'number' ? Number(e.target.value) : e.target.value,
                      }))
                    }
                  />
                )}
                {s.description && (
                  <Text fontSize="xs" color="gray.500" mt="4px">
                    {s.description}
                  </Text>
                )}
              </FormControl>
            ))}
          </SimpleGrid>
        </Box>
      ))}
    </Box>
  );
}
