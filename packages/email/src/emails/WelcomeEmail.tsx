import { Html, Head, Preview, Body, Container, Text, Tailwind, Button } from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
}

export const WelcomeEmail = ({ name }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to our platform!</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {name},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Welcome! We are incredibly excited to have you on board.
            </Text>
            <Button
              className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-4 py-3"
              href="https://app.example.com/login"
            >
              Get Started
            </Button>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
