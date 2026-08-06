import { Html, Head, Preview, Body, Container, Text, Tailwind, Button } from "@react-email/components";

interface PasswordResetEmailProps {
  resetLink: string;
}

export const PasswordResetEmail = ({ resetLink }: PasswordResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Text className="text-black text-[14px] leading-[24px]">
              We received a request to reset your password.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Click the button below to choose a new password. If you didn't request this, you can safely ignore this email.
            </Text>
            <Button
              className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-4 py-3"
              href={resetLink}
            >
              Reset Password
            </Button>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PasswordResetEmail;
