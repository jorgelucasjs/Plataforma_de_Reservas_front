import { getData } from '@/dao/localStorage';
import type { User } from '@/types';
import { LOCALSTORAGE_USERDATA } from '@/utils/LocalstorageKeys';
import { Box, Spinner } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const location = useLocation();

	useEffect(() => {
		const loadUserFromLocalStorage = () => {
			try {
				const userData = getData(LOCALSTORAGE_USERDATA);
				if (userData) {
					setUser(userData);
					setLoading(false);
					return;
				}
				setUser(null);
				setLoading(false);
			} catch (error) {
				console.error('Erro ao carregar dados do localStorage:', error);
				setUser(null);
				setLoading(false);
			}
		};
		loadUserFromLocalStorage();
	}, []);

	if (loading) {
		return (
			<Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
				<Spinner size="lg" color="blue.500" />
			</Box>
		);
	}

	if (!user) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return <>{children}</>;
};

export default ProtectedRoute;