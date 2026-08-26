import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Tailwind,
  Text,
} from "react-email";

interface PasswordResetEmailProps {
  resetLink: string;
  preview: string;
  requestText: string;
  instructionText: string;
  buttonText: string;
}

export const PasswordResetEmail = ({
  resetLink,
  preview,
  requestText,
  instructionText,
  buttonText,
}: PasswordResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Text className="text-black text-[14px] leading-[24px]">{requestText}</Text>
            <Text className="text-black text-[14px] leading-[24px]">{instructionText}</Text>
            <Button
              className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-4 py-3"
              href={resetLink}
            >
              {buttonText}
            </Button>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PasswordResetEmail;
