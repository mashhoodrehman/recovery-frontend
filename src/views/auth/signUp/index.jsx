import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import DefaultAuth from 'layouts/auth/Default';
import illustration from 'assets/img/auth/auth.png';
import { useAuth } from 'context/AuthContext';
import { extractApiError } from 'hooks/useApiError';

export default function SignUp() {
  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.400';
  const textColorBrand = useColorModeValue('brand.500', 'white');
  const brandStars = useColorModeValue('brand.500', 'brand.400');

  const navigate = useNavigate();
  const { signup } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { role: 'customer' } });

  const onSubmit = async (values) => {
    try {
      await signup(values);
      toast.success('Account created');
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      <Flex
        maxW={{ base: '100%', md: 'max-content' }}
        w="100%"
        mx={{ base: 'auto', lg: '0px' }}
        me="auto"
        h="100%"
        alignItems="start"
        justifyContent="center"
        mb={{ base: '30px', md: '60px' }}
        px={{ base: '25px', md: '0px' }}
        mt={{ base: '40px', md: '8vh' }}
        flexDirection="column"
      >
        <Box me="auto">
          <Heading color={textColor} fontSize="36px" mb="10px">
            Create account
          </Heading>
          <Text mb="36px" ms="4px" color={textColorSecondary} fontWeight="400" fontSize="md">
            Tell us a little about yourself
          </Text>
        </Box>
        <Flex
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          direction="column"
          w={{ base: '100%', md: '480px' }}
          maxW="100%"
        >
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px" mb="4px">
            <FormControl isInvalid={!!errors.firstName}>
              <FormLabel fontSize="sm" color={textColor}>
                First name<Text color={brandStars}>*</Text>
              </FormLabel>
              <Input variant="auth" size="lg" {...register('firstName', { required: 'Required' })} />
              <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" color={textColor}>
                Last name
              </FormLabel>
              <Input variant="auth" size="lg" {...register('lastName')} />
            </FormControl>
          </SimpleGrid>

          <FormControl isInvalid={!!errors.email} mt="16px">
            <FormLabel fontSize="sm" color={textColor}>
              Email<Text color={brandStars}>*</Text>
            </FormLabel>
            <Input
              variant="auth"
              size="lg"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
              })}
            />
            <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
          </FormControl>

          <FormControl mt="16px">
            <FormLabel fontSize="sm" color={textColor}>
              Phone
            </FormLabel>
            <Input variant="auth" size="lg" {...register('phone')} />
          </FormControl>

          <FormControl isInvalid={!!errors.password} mt="16px">
            <FormLabel fontSize="sm" color={textColor}>
              Password<Text color={brandStars}>*</Text>
            </FormLabel>
            <Input
              variant="auth"
              size="lg"
              type="password"
              placeholder="Min. 8 characters"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Min 8 characters' },
              })}
            />
            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
          </FormControl>

          <FormControl mt="16px">
            <FormLabel fontSize="sm" color={textColor}>
              I want to
            </FormLabel>
            <Select variant="auth" size="lg" {...register('role')}>
              <option value="customer">Request recovery (Customer)</option>
              <option value="recovery-provider">Provide recovery (Provider)</option>
            </Select>
          </FormControl>

          <Button
            type="submit"
            fontSize="sm"
            variant="brand"
            fontWeight="500"
            w="100%"
            h="50"
            mt="24px"
            mb="24px"
            isLoading={isSubmitting}
          >
            Create account
          </Button>

          <Flex>
            <Text color="gray.400" fontSize="14px">
              Already have an account?
              <NavLink to="/auth/sign-in">
                <Text color={textColorBrand} as="span" ms="5px" fontWeight="500">
                  Sign in
                </Text>
              </NavLink>
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}
