import React from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
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
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import DefaultAuth from 'layouts/auth/Default';
import illustration from 'assets/img/auth/auth.png';
import { authService } from 'services/auth.service';
import { extractApiError } from 'hooks/useApiError';

export default function ResetPassword() {
  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.400';
  const textColorBrand = useColorModeValue('brand.500', 'white');
  const brandStars = useColorModeValue('brand.500', 'brand.400');

  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (values) => {
    if (!token) {
      toast.error('Missing reset token');
      return;
    }
    try {
      await authService.resetPassword({ token, password: values.password });
      toast.success('Password reset. You can sign in now.');
      navigate('/auth/sign-in', { replace: true });
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
        mt={{ base: '40px', md: '14vh' }}
        flexDirection="column"
      >
        <Box me="auto">
          <Heading color={textColor} fontSize="36px" mb="10px">
            Reset password
          </Heading>
          <Text mb="36px" ms="4px" color={textColorSecondary} fontWeight="400" fontSize="md">
            Choose a new password
          </Text>
        </Box>
        <Flex
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          direction="column"
          w={{ base: '100%', md: '420px' }}
          maxW="100%"
        >
          <FormControl isInvalid={!!errors.password}>
            <FormLabel fontSize="sm" color={textColor}>
              New password<Text color={brandStars}>*</Text>
            </FormLabel>
            <Input
              variant="auth"
              size="lg"
              type="password"
              placeholder="Min. 8 characters"
              {...register('password', {
                required: 'Required',
                minLength: { value: 8, message: 'Min 8 characters' },
              })}
            />
            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.confirm} mt="16px">
            <FormLabel fontSize="sm" color={textColor}>
              Confirm password<Text color={brandStars}>*</Text>
            </FormLabel>
            <Input
              variant="auth"
              size="lg"
              type="password"
              {...register('confirm', {
                required: 'Required',
                validate: (v) => v === password || 'Passwords do not match',
              })}
            />
            <FormErrorMessage>{errors.confirm?.message}</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            variant="brand"
            fontWeight="500"
            w="100%"
            h="50"
            mt="24px"
            mb="24px"
            isLoading={isSubmitting}
          >
            Reset password
          </Button>
          <Text color="gray.400" fontSize="14px">
            <NavLink to="/auth/sign-in">
              <Text color={textColorBrand} as="span" fontWeight="500">
                Back to sign in
              </Text>
            </NavLink>
          </Text>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}
