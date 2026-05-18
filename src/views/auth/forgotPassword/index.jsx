import React from 'react';
import { NavLink } from 'react-router-dom';
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

export default function ForgotPassword() {
  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.400';
  const textColorBrand = useColorModeValue('brand.500', 'white');
  const brandStars = useColorModeValue('brand.500', 'brand.400');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      await authService.forgotPassword(values);
      toast.success('If the email exists, a reset link has been sent');
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
            Forgot password
          </Heading>
          <Text mb="36px" ms="4px" color={textColorSecondary} fontWeight="400" fontSize="md">
            We'll email you a reset link
          </Text>
        </Box>
        <Flex
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          direction="column"
          w={{ base: '100%', md: '420px' }}
          maxW="100%"
        >
          <FormControl isInvalid={!!errors.email}>
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
          <Button
            type="submit"
            variant="brand"
            fontWeight="500"
            w="100%"
            h="50"
            mt="24px"
            mb="24px"
            isLoading={isSubmitting}
            isDisabled={isSubmitSuccessful}
          >
            Send reset link
          </Button>
          <Text color="gray.400" fontSize="14px">
            Remembered it?
            <NavLink to="/auth/sign-in">
              <Text color={textColorBrand} as="span" ms="5px" fontWeight="500">
                Sign in
              </Text>
            </NavLink>
          </Text>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}
