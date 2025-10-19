import { Box, Container, Flex, Heading, Text, Button, Stack, Grid, VStack, HStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FaRocket, FaUserPlus, FaSignInAlt, FaHandshake, FaShieldAlt, FaClock, FaChartLine, FaUsers, FaStar } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

export function LandingPage() {
	const navigate = useNavigate();

	return (
		<Box>
			{/* Hero Section */}
			<Box
				bgGradient="linear(to-br, navy.500, navy.700)"
				color="white"
				minH="100vh"
				position="relative"
				overflow="hidden"
			>
				{/* Decorative elements */}
				<Box
					position="absolute"
					top="-10%"
					right="-5%"
					w="500px"
					h="500px"
					borderRadius="full"
					bg="primary.500"
					opacity="0.1"
					filter="blur(100px)"
				/>
				<Box
					position="absolute"
					bottom="-10%"
					left="-5%"
					w="400px"
					h="400px"
					borderRadius="full"
					bg="accent.500"
					opacity="0.1"
					filter="blur(100px)"
				/>

				<Container maxW="7xl" pt={{ base: 8, md: 16 }} pb={{ base: 16, md: 24 }} position="relative" zIndex={1}>
					{/* Header */}
					<Flex justify="space-between" align="center" mb={{ base: 12, md: 20 }}>
						<HStack gap={2}>
							<Box
								bg="primary.500"
								p={2}
								borderRadius="lg"
								display="flex"
								alignItems="center"
								justifyContent="center"
							>
								<FaRocket size={24} />
							</Box>
							<Heading size="xl" fontWeight="bold" color="gray.600">
								AgendeSmart
							</Heading>
						</HStack>

						<HStack gap={3}>
							<Button
								variant="ghost"
								color="black"
								onClick={() => navigate("/login")}
								size={{ base: "sm", md: "md" }}
							>
								<FaSignInAlt />
								Entrar
							</Button>
							<Button
								bg="primary.500"
								color="white"
								onClick={() => navigate("/login")}
								_hover={{ bg: "primary.600" }}
								size={{ base: "sm", md: "md" }}
							>
								<FaUserPlus />
								Criar Conta
							</Button>
						</HStack>
					</Flex>

					{/* Hero Content */}
					<Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={12} alignItems="center">
						<VStack align="flex-start" gap={6}>
							<Box>
								<Text
									fontSize={{ base: "sm", md: "md" }}
									fontWeight="semibold"
									color="primary.300"
									textTransform="uppercase"
									letterSpacing="wider"
									mb={4}
								>
									Plataforma de Serviços Profissionais
								</Text>
								<Heading
									as="h1"
									fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
									fontWeight="extrabold"
									lineHeight="1.2"
									mb={6}
									color={"primary.600"}
								>
									Conecte-se com os{" "}
									<Text as="span" color="primary.400">
										Melhores Profissionais
									</Text>
								</Heading>
								<Text fontSize={{ base: "lg", md: "xl" }} color="gray.600" maxW="600px">
									A plataforma que une clientes e prestadores de serviços de forma simples, segura e eficiente.
									Encontre o profissional ideal ou ofereça seus serviços.
								</Text>
							</Box>

							<Stack direction={{ base: "column", sm: "row" }} gap={4} w={{ base: "full", sm: "auto" }}>
								<Button
									size="lg"
									bg="primary.500"
									color="white"
									onClick={() => navigate("/login")}
									_hover={{ bg: "primary.600", transform: "translateY(-2px)" }}
									transition="all 0.3s"
									px={8}
									h={14}
								>
									<FaUserPlus />
									Começar Agora
								</Button>
								<Button
									size="lg"
									variant="outline"
									borderColor="whiteAlpha.400"
									color="white"
									_hover={{ bg: "whiteAlpha.200", borderColor: "primary.400" }}
									transition="all 0.3s"
									px={8}
									h={14}
								>
									<FaHandshake />
									Saiba Mais
								</Button>
							</Stack>

							{/* Stats */}
							<HStack gap={8} pt={8} flexWrap="wrap">
								<VStack align="flex-start" gap={1}>
									<Heading size="2xl" color="primary.400">
										500+
									</Heading>
									<Text color="gray.400" fontSize="sm">
										Serviços Ativos
									</Text>
								</VStack>
								<VStack align="flex-start" gap={1}>
									<Heading size="2xl" color="primary.400">
										1.2k+
									</Heading>
									<Text color="gray.400" fontSize="sm">
										Usuários
									</Text>
								</VStack>
								<VStack align="flex-start" gap={1}>
									<Heading size="2xl" color="primary.400">
										98%
									</Heading>
									<Text color="gray.400" fontSize="sm">
										Satisfação
									</Text>
								</VStack>
							</HStack>
						</VStack>

						{/* Hero Image/Illustration */}
						<Box display={{ base: "none", lg: "block" }}>
							<Box
								bg="whiteAlpha.100"
								backdropFilter="blur(10px)"
								borderRadius="2xl"
								p={8}
								border="1px solid"
								borderColor="whiteAlpha.200"
							>
								<Grid templateColumns="repeat(2, 1fr)" gap={4}>
									{[
										{ icon: FaUsers, label: "Clientes", color: "primary.400" },
										{ icon: FaChartLine, label: "Crescimento", color: "accent.400" },
										{ icon: FaShieldAlt, label: "Segurança", color: "green.400" },
										{ icon: MdVerified, label: "Verificado", color: "blue.400" },
									].map((item, idx) => (
										<Box
											key={idx}
											bg="whiteAlpha.200"
											p={6}
											borderRadius="xl"
											textAlign="center"
											_hover={{ bg: "whiteAlpha.300", transform: "scale(1.05)" }}
											transition="all 0.3s"
										>
											<Box color={item.color} mb={3} display="flex" justifyContent="center">
												<item.icon size={32} />
											</Box>
											<Text fontWeight="semibold" color="gray.600">{item.label}</Text>
										</Box>
									))}
								</Grid>
							</Box>
						</Box>
					</Grid>
				</Container>
			</Box>

			{/* Features Section */}
			<Box bg="white" py={{ base: 16, md: 24 }}>
				<Container maxW="7xl">
					<VStack gap={4} mb={16} textAlign="center">
						<Text
							fontSize="sm"
							fontWeight="semibold"
							color="primary.500"
							textTransform="uppercase"
							letterSpacing="wider"
						>
							Por que escolher a AgendeSmart?
						</Text>
						<Heading size="2xl" color="navy.500">
							Tudo que você precisa em um só lugar
						</Heading>
						<Text fontSize="lg" color="gray.600" maxW="2xl">
							Oferecemos uma plataforma completa para conectar profissionais e clientes de forma eficiente
						</Text>
					</VStack>

					<Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={8}>
						{[
							{
								icon: FaHandshake,
								title: "Conexão Direta",
								description: "Conecte-se diretamente com prestadores de serviços qualificados sem intermediários",
								color: "primary.500",
							},
							{
								icon: FaShieldAlt,
								title: "Pagamentos Seguros",
								description: "Sistema de pagamento integrado e seguro com controle de saldo em tempo real",
								color: "green.500",
							},
							{
								icon: FaClock,
								title: "Rápido e Fácil",
								description: "Contrate serviços em poucos cliques e acompanhe tudo pelo painel",
								color: "blue.500",
							},
							{
								icon: MdVerified,
								title: "Profissionais Verificados",
								description: "Todos os prestadores passam por verificação para garantir qualidade",
								color: "purple.500",
							},
							{
								icon: FaChartLine,
								title: "Histórico Completo",
								description: "Acompanhe todas as transações e serviços contratados em um só lugar",
								color: "orange.500",
							},
							{
								icon: FaStar,
								title: "Avaliações",
								description: "Sistema de avaliações para garantir a melhor experiência para todos",
								color: "yellow.500",
							},
						].map((feature, idx) => (
							<Box
								key={idx}
								bg="gray.50"
								p={8}
								borderRadius="xl"
								border="1px solid"
								borderColor="gray.200"
								_hover={{ borderColor: feature.color, transform: "translateY(-4px)", shadow: "lg" }}
								transition="all 0.3s"
							>
								<Box
									bg={`${feature.color.split(".")[0]}.100`}
									color={feature.color}
									w={14}
									h={14}
									borderRadius="lg"
									display="flex"
									alignItems="center"
									justifyContent="center"
									mb={4}
								>
									<feature.icon size={28} />
								</Box>
								<Heading size="md" mb={3} color="navy.500">
									{feature.title}
								</Heading>
								<Text color="gray.600">{feature.description}</Text>
							</Box>
						))}
					</Grid>
				</Container>
			</Box>

			{/* CTA Section */}
			<Box bg="navy.500" color="white" py={{ base: 16, md: 24 }}>
				<Container maxW="5xl">
					<VStack gap={8} textAlign="center">
						<Heading size="2xl">Pronto para começar?</Heading>
						<Text fontSize="xl" color="gray.300" maxW="2xl">
							Junte-se a milhares de usuários que já estão usando a AgendeSmart para encontrar e oferecer serviços
						</Text>
						<Stack direction={{ base: "column", sm: "row" }} gap={4}>
							<Button
								size="lg"
								bg="primary.500"
								color="white"
								onClick={() => navigate("/login")}
								_hover={{ bg: "primary.600" }}
								px={8}
								h={14}
							>
								<FaUserPlus />
								Criar Conta Grátis
							</Button>
							<Button
								size="lg"
								variant="outline"
								borderColor="whiteAlpha.400"
								color="white"
								onClick={() => navigate("/login")}
								_hover={{ bg: "whiteAlpha.200" }}
								px={8}
								h={14}
							>
								<FaSignInAlt />
								Já tenho conta
							</Button>
						</Stack>
					</VStack>
				</Container>
			</Box>

			{/* Footer */}
			<Box bg="navy.700" color="gray.400" py={8}>
				<Container maxW="7xl">
					<Flex
						direction={{ base: "column", md: "row" }}
						justify="space-between"
						align="center"
						gap={4}
					>
						<HStack gap={2}>
							<Box
								bg="primary.500"
								p={2}
								borderRadius="lg"
								display="flex"
								alignItems="center"
								justifyContent="center"
							>
								<FaRocket size={20} />
							</Box>
							<Text fontWeight="semibold" color="white">
								AgendeSmart
							</Text>
						</HStack>
						<Text fontSize="sm">© 2024 AgendeSmart. Todos os direitos reservados.</Text>
					</Flex>
				</Container>
			</Box>
		</Box>
	);
}
