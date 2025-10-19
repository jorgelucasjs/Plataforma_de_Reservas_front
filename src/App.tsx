import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

export function App() {

	return (
		<ChakraProvider value={defaultSystem}>
			<BrowserRouter>
				<Routes>
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
		</ChakraProvider>
	);
}