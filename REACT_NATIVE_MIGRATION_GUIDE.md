# Guia de Migração para React Native Expo - AgendaLa

Este guia fornece todas as instruções para migrar a aplicação web AgendaLa para React Native Expo, mantendo toda a lógica de negócio, arquitetura e design system.

## 📋 Visão Geral da Arquitetura

O projeto web utiliza uma arquitetura bem estruturada que pode ser facilmente adaptada para React Native:

- **DAO (Data Access Objects)**: Camada de acesso aos dados via API
- **Stores (Zustand)**: Gerenciamento de estado global
- **Types**: Interfaces TypeScript compartilhadas
- **UI Components**: Componentes de interface
- **Theme System**: Sistema de cores e estilos

## 🚀 Configuração Inicial do Projeto Expo

### 1. Criar o projeto Expo

```bash
npx create-expo-app@latest AgendaLaApp --template typescript
cd AgendaLaApp
```

### 2. Instalar dependências principais

```bash
# Navegação
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context

# Estado global
npm install zustand

# HTTP Client
npm install axios

# Formulários e validação
npm install react-hook-form @hookform/resolvers zod

# Ícones
npm install react-native-vector-icons
npx expo install expo-vector-icons

# AsyncStorage (substituto do localStorage)
npx expo install @react-native-async-storage/async-storage

# UI Components (NativeBase como alternativa ao Chakra UI)
npm install native-base react-native-svg
npx expo install react-native-safe-area-context

# Ou usar React Native Elements
npm install react-native-elements react-native-paper
```

## 🎨 Sistema de Cores e Tema

### Arquivo: `src/theme/colors.ts`

```typescript
// Paleta de cores baseada no projeto web
export const COLORS = {
  // Cores principais
  primary: {
    50: "#e6fffa",
    100: "#b3fff0", 
    200: "#80ffe6",
    300: "#4dffdc",
    400: "#1affd2",
    500: "#00e6b8", // Turquesa principal
    600: "#00b38f",
    700: "#008066",
    800: "#004d3d",
    900: "#001a14",
  },
  
  navy: {
    50: "#e8eef5",
    100: "#c2d4e6",
    200: "#9bb9d7", 
    300: "#749fc8",
    400: "#4d84b9",
    500: "#1a3a52", // Azul marinho escuro
    600: "#152e42",
    700: "#102331",
    800: "#0b1721",
    900: "#050c10",
  },
  
  accent: {
    50: "#fff5e6",
    100: "#ffe6b3",
    200: "#ffd780",
    300: "#ffc84d", 
    400: "#ffb91a",
    500: "#e6a500", // Amarelo/dourado
    600: "#b38000",
    700: "#805c00",
    800: "#4d3700",
    900: "#1a1300",
  },
  
  // Backgrounds
  bg: {
    primary: "#1a3a52",
    secondary: "#f8fafb", 
    card: "#ffffff",
    dark: "#1a3a52",
  },
  
  // Text
  text: {
    primary: "#1a202c",
    secondary: "#4a5568",
    muted: "#718096", 
    inverse: "#ffffff",
  },
  
  // Status colors
  success: "#48bb78",
  error: "#f56565",
  warning: "#ed8936",
  info: "#4299e1",
};

// Tema para NativeBase
export const nativeBaseTheme = {
  colors: {
    primary: COLORS.primary,
    secondary: COLORS.navy,
    accent: COLORS.accent,
    success: COLORS.success,
    error: COLORS.error,
    warning: COLORS.warning,
    info: COLORS.info,
  },
  config: {
    initialColorMode: 'light',
  },
};
```

### Arquivo: `src/theme/index.ts`

```typescript
import { COLORS, nativeBaseTheme } from './colors';

export const theme = {
  colors: COLORS,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export { nativeBaseTheme };
export default theme;
```

## 📱 Estrutura de Pastas

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (Button, Input, etc.)
│   ├── forms/          # Componentes de formulário
│   └── navigation/     # Componentes de navegação
├── screens/            # Telas da aplicação
├── dao/               # Data Access Objects (API calls)
├── stores/            # Zustand stores
├── types/             # TypeScript interfaces
├── theme/             # Sistema de cores e estilos
├── utils/             # Utilitários
├── hooks/             # Custom hooks
└── navigation/        # Configuração de navegação
```

## 🔄 Migração dos DAOs

### Arquivo: `src/dao/apiClient.ts`

```typescript
import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://us-central1-angolaeventos-cd238.cloudfunctions.net/sistemaDeReservaServer';
const STORAGE_USER_KEY = 'LOCAL_STORAGE_USER_DATA';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor para adicionar token
    this.client.interceptors.request.use(async (config) => {
      try {
        const userDataStr = await AsyncStorage.getItem(STORAGE_USER_KEY);
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          if (userData?.token) {
            config.headers.Authorization = `Bearer ${userData.token}`;
          }
        }
      } catch (error) {
        console.error('Erro ao buscar token:', error);
      }
      return config;
    });

    // Response interceptor para tratar erros
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem(STORAGE_USER_KEY);
          // Navegar para tela de login
          // NavigationService.navigate('Login');
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: any) {
    return this.client.get<T>(url, { params });
  }

  async post<T>(url: string, data?: any) {
    return this.client.post<T>(url, data);
  }

  async put<T>(url: string, data?: any) {
    return this.client.put<T>(url, data);
  }

  async delete<T>(url: string) {
    return this.client.delete<T>(url);
  }
}

export default new ApiClient();
```

### Arquivo: `src/dao/asyncStorage.ts`

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utility functions for AsyncStorage management (substituto do localStorage)
 */

export async function getData(key: string): Promise<any> {
  try {
    const item = await AsyncStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting data from AsyncStorage for key ${key}:`, error);
    return null;
  }
}

export async function setData(key: string, value: any): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting data to AsyncStorage for key ${key}:`, error);
  }
}

export async function removeData(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data from AsyncStorage for key ${key}:`, error);
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing AsyncStorage:', error);
  }
}

export async function hasData(key: string): Promise<boolean> {
  try {
    const item = await AsyncStorage.getItem(key);
    return item !== null;
  } catch (error) {
    console.error(`Error checking data in AsyncStorage for key ${key}:`, error);
    return false;
  }
}
```

## 🏪 Migração dos Stores Zustand

### Arquivo: `src/stores/authStore.ts`

```typescript
import { create } from 'zustand';
import { authDao } from '../dao';
import type { User } from '../types';
import { setData, removeData } from '../dao/asyncStorage';

const STORAGE_USER_KEY = 'LOCAL_STORAGE_USER_DATA';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  register: (data: any) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authDao.register(data);
      const { token, user } = response.data.data;

      await setData(STORAGE_USER_KEY, {
        ...user,
        token: token,
      });

      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao registar';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authDao.login({ email, password });
      const { token, user } = response.data.data;
      
      await setData(STORAGE_USER_KEY, {
        ...user,
        token: token,
      });
      
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao autenticar';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await removeData(STORAGE_USER_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },

  initializeAuth: async () => {
    try {
      const userData = await getData(STORAGE_USER_KEY);
      if (userData && userData.token) {
        set({ 
          user: userData, 
          token: userData.token, 
          isAuthenticated: true 
        });
      }
    } catch (error) {
      console.error('Erro ao inicializar autenticação:', error);
    }
  },

  clearError: () => set({ error: null }),
}));
```

## 🧩 Componentes UI Base

### Arquivo: `src/components/ui/Button.tsx`

```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    if (fullWidth) baseStyle.push(styles.fullWidth);
    if (disabled) baseStyle.push(styles.disabled);
    
    switch (variant) {
      case 'secondary':
        baseStyle.push(styles.secondary);
        break;
      case 'outline':
        baseStyle.push(styles.outline);
        break;
      default:
        baseStyle.push(styles.primary);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}`]];
    
    switch (variant) {
      case 'outline':
        baseStyle.push(styles.textOutline);
        break;
      default:
        baseStyle.push(styles.textDefault);
    }
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary[500] : COLORS.text.inverse} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Sizes
  sm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 32,
  },
  md: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  lg: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 52,
  },
  
  // Variants
  primary: {
    backgroundColor: COLORS.primary[500],
  },
  secondary: {
    backgroundColor: COLORS.navy[500],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary[500],
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  
  // Text styles
  text: {
    fontWeight: '600',
  },
  textSm: {
    fontSize: 14,
  },
  textMd: {
    fontSize: 16,
  },
  textLg: {
    fontSize: 18,
  },
  textDefault: {
    color: COLORS.text.inverse,
  },
  textOutline: {
    color: COLORS.primary[500],
  },
});
```

### Arquivo: `src/components/ui/Input.tsx`

```typescript
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
  numberOfLines = 1,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
        multiline && styles.inputContainerMultiline,
      ]}>
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.text.muted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={togglePasswordVisibility}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={COLORS.text.muted}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.text.muted,
    borderRadius: 8,
    backgroundColor: COLORS.bg.card,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary[500],
  },
  inputContainerError: {
    borderColor: COLORS.error,
  },
  inputContainerMultiline: {
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  eyeIcon: {
    padding: 12,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
});
```

## 📱 Navegação

### Arquivo: `src/navigation/AppNavigator.tsx`

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ServicesScreen } from '../screens/ServicesScreen';
import { CreateServiceScreen } from '../screens/CreateServiceScreen';
import { BookingsScreen } from '../screens/BookingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

// Auth
import { useAuthStore } from '../stores/authStore';
import { COLORS } from '../theme/colors';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Services':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'Bookings':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary[500],
        tabBarInactiveTintColor: COLORS.text.muted,
        headerStyle: {
          backgroundColor: COLORS.navy[500],
        },
        headerTintColor: COLORS.text.inverse,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Services" component={ServicesScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen 
              name="CreateService" 
              component={CreateServiceScreen}
              options={{
                headerShown: true,
                title: 'Criar Serviço',
                headerStyle: { backgroundColor: COLORS.navy[500] },
                headerTintColor: COLORS.text.inverse,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

## 📱 Exemplo de Tela - Login

### Arquivo: `src/screens/LoginScreen.tsx`

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { COLORS } from '../theme/colors';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [nif, setNif] = useState('');
  const [userType, setUserType] = useState<'client' | 'provider'>('client');

  const { login, register, isLoading, error } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    try {
      await login(email, password);
    } catch (error) {
      Alert.alert('Erro', 'Falha no login');
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !fullName || !nif) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    try {
      await register({
        fullName,
        nif,
        email,
        password,
        userType,
      });
    } catch (error) {
      Alert.alert('Erro', 'Falha no registro');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>AgendaLa</Text>
            <Text style={styles.subtitle}>
              {isRegister ? 'Criar conta' : 'Entrar na sua conta'}
            </Text>
          </View>

          <View style={styles.form}>
            {isRegister && (
              <>
                <Input
                  label="Nome completo"
                  placeholder="Digite seu nome completo"
                  value={fullName}
                  onChangeText={setFullName}
                />
                <Input
                  label="NIF"
                  placeholder="Digite seu NIF"
                  value={nif}
                  onChangeText={setNif}
                  keyboardType="numeric"
                />
              </>
            )}

            <Input
              label="Email"
              placeholder="Digite seu email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Senha"
              placeholder="Digite sua senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Button
              title={isRegister ? 'Registar' : 'Entrar'}
              onPress={isRegister ? handleRegister : handleLogin}
              isLoading={isLoading}
              fullWidth
            />

            <Button
              title={isRegister ? 'Já tem conta? Entrar' : 'Criar conta'}
              onPress={() => setIsRegister(!isRegister)}
              variant="outline"
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.secondary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.navy[500],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  form: {
    gap: 16,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 16,
  },
});
```

## 🔧 Utilitários e Constantes

### Arquivo: `src/utils/constants.ts`

```typescript
export const STORAGE_KEYS = {
  USER_DATA: 'LOCAL_STORAGE_USER_DATA',
  THEME: 'THEME_PREFERENCE',
};

export const API_ENDPOINTS = {
  BASE_URL: 'https://us-central1-angolaeventos-cd238.cloudfunctions.net/sistemaDeReservaServer',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ADD_BALANCE: '/auth/add-balance',
  },
  SERVICES: {
    BASE: '/services',
    MY: '/services/my',
    BY_PROVIDER: (id: string) => `/services/provider/${id}`,
  },
  BOOKINGS: {
    BASE: '/bookings',
    MY: '/bookings/my',
    HISTORY: '/bookings/history',
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
  },
};
```

## 📋 Checklist de Migração

### ✅ Estrutura Base
- [ ] Criar projeto Expo com TypeScript
- [ ] Configurar estrutura de pastas
- [ ] Instalar dependências principais

### ✅ Sistema de Design
- [ ] Migrar paleta de cores
- [ ] Criar componentes UI base (Button, Input, Card)
- [ ] Configurar tema global

### ✅ Dados e Estado
- [ ] Migrar tipos TypeScript
- [ ] Adaptar DAOs para React Native
- [ ] Migrar stores Zustand
- [ ] Substituir localStorage por AsyncStorage

### ✅ Navegação
- [ ] Configurar React Navigation
- [ ] Criar stack e tab navigators
- [ ] Implementar rotas protegidas

### ✅ Telas
- [ ] Migrar tela de login
- [ ] Migrar dashboard
- [ ] Migrar telas de serviços
- [ ] Migrar telas de reservas
- [ ] Migrar perfil do usuário

### ✅ Funcionalidades
- [ ] Autenticação JWT
- [ ] CRUD de serviços
- [ ] Sistema de reservas
- [ ] Histórico de transações
- [ ] Gerenciamento de saldo

## 🚀 Comandos de Desenvolvimento

```bash
# Iniciar o projeto
npx expo start

# Executar no iOS
npx expo start --ios

# Executar no Android
npx expo start --android

# Build para produção
npx expo build:android
npx expo build:ios
```

## 📝 Notas Importantes

1. **AsyncStorage**: Substitui o localStorage do web
2. **Navegação**: React Navigation substitui React Router
3. **Estilos**: StyleSheet do React Native substitui CSS/Chakra UI
4. **Ícones**: Expo Vector Icons substitui React Icons
5. **Formulários**: Manter react-hook-form e zod
6. **Estado**: Zustand funciona igual no React Native
7. **API**: Axios funciona igual, apenas adaptar interceptors

Este guia fornece uma base sólida para migrar toda a lógica e design do projeto web para React Native Expo, mantendo a mesma arquitetura e funcionalidades.