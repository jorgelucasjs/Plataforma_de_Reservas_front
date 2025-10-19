import { ChakraProvider } from "@chakra-ui/react";
import { system } from "./theme";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./ui/pages/LoginPage";
import { DashboardPage } from "./ui/pages/DashboardPage";
import { ServicesPage } from "./ui/pages/ServicesPage";
import { CreateServicePage } from "./ui/pages/CreateServicePage";
import { EditServicePage } from "./ui/pages/EditServicePage";
import { BookingsPage } from "./ui/pages/BookingsPage";
import { HistoryPage } from "./ui/pages/HistoryPage";
import { ProfilePage } from "./ui/pages/ProfilePage";
import { Navigation } from "./ui/components/Navigation";
import { Toaster } from "./ui/components/ui/toaster";
import ProtectedRoute from "./ui/routes/ProtectedRoute";
import { ColorModeProvider } from "./ui/components/ui/color-mode";
import { LandingPage } from "./ui/pages/LandingPage";

export function App() {

	return (
		<ChakraProvider value={system}>
			<ColorModeProvider defaultTheme="light" forcedTheme="light">
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<LandingPage />} />
						<Route path="/login" element={<LoginPage />} />

						<Route
							path="/dashboard"
							element={
								<ProtectedRoute>
									<Navigation />
									<DashboardPage />
								</ProtectedRoute>
							}
						/>

						<Route
							path="/services"
							element={
								<ProtectedRoute>
									<Navigation />
									<ServicesPage />
								</ProtectedRoute>
							}
						/>

						<Route
							path="/services/new"
							element={
								<ProtectedRoute>
									<Navigation />
									<CreateServicePage />
								</ProtectedRoute>
							}
						/>

						<Route
							path="/services/:id/edit"
							element={
								<ProtectedRoute>
									<Navigation />
									<EditServicePage />
								</ProtectedRoute>
							}
						/>

						<Route
							path="/bookings"
							element={
								<ProtectedRoute>
									<Navigation />
									<BookingsPage />
								</ProtectedRoute>
							}
						/>

						<Route
							path="/history"
							element={
								<ProtectedRoute>
									<Navigation />
									<HistoryPage />
								</ProtectedRoute>
							}
						/>

						<Route
							path="/profile"
							element={
								<ProtectedRoute>
									<Navigation />
									<ProfilePage />
								</ProtectedRoute>
							}
						/>

						{/* <Route path="/" element={<Navigate to="/dashboard" />} /> */}
					</Routes>
					<Toaster />
				</BrowserRouter>
			</ColorModeProvider>
		</ChakraProvider>
	);
}