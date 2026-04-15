import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import Loading from './components/Loading';

// Importa los Layouts directamente
import { AdminLayout, PublicLayout } from './layouts';
// Importamos los validadores de rutas si los tienes (opcional, por ahora los simplificamos en las rutas)
import { ProtectedRoute } from './routers'; 

// Admin
const DashboardPage = lazy(() => import('./pages/Admin/Dashboard'));
const MovieList = lazy(() => import('./pages/Admin/MovieList'));
const CinemaList = lazy(() => import('./pages/Admin/CinemaList'));
const ShowtimeList = lazy(() => import('./pages/Admin/ShowtimeList'));
const ReservationList = lazy(() => import('./pages/Admin/ReservationList'));
const User = lazy(() => import('./pages/Admin/User'));
const Account = lazy(() => import('./pages/Admin/Account'));

// Register - Login
const Register = lazy(() => import('./pages/Public/Register'));
const Login = lazy(() => import('./pages/Public/Login'));

// Public
const HomePage = lazy(() => import('./pages/Public/HomePage'));
const MoviePage = lazy(() => import('./pages/Public/MoviePage'));
const MyDashboard = lazy(() => import('./pages/Public/MyDashboard'));
const MovieCategoryPage = lazy(() => import('./pages/Public/MovieCategoryPage'));
const CinemasPage = lazy(() => import('./pages/Public/CinemasPage'));
const BookingPage = lazy(() => import('./pages/Public/BookingPage'));

const Checkin = lazy(() => import('./pages/Public/Checkin'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Router>
        <Routes>
          {/* Rutas sin Layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas Públicas (Envueltas en PublicLayout) */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/checkin/:reservationId" element={<Checkin />} />
            <Route path="/mydashboard" element={<MyDashboard />} />
            <Route path="/cinemas" element={<CinemasPage />} />
            <Route path="/movie/category/:category" element={<MovieCategoryPage />} />
          </Route>

          {/* Rutas Públicas sin Footer (Aún usan PublicLayout pero le pasamos props diferentes) */}
          <Route element={<PublicLayout withFooter={false} />}>
            <Route path="/movie/:id" element={<MoviePage />} />
            <Route path="/movie/booking/:id" element={<BookingPage />} />
          </Route>

          {/* Rutas de Administrador (Protegidas y con AdminLayout) */}
          <Route element={<AdminLayout />}>
             {/* Nota: Aquí idealmente envolverías estas en tu <ProtectedRoute> */}
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/users" element={<User />} />
            <Route path="/admin/showtimes" element={<ShowtimeList />} />
            <Route path="/admin/reservations" element={<ReservationList />} />
            <Route path="/admin/cinemas" element={<CinemaList />} />
            <Route path="/admin/movies" element={<MovieList />} />
            <Route path="/admin/account" element={<Account />} />
          </Route>

          {/* Ruta 404 - Not Found */}
          <Route path="*" element={<div>404 NOT FOUND</div>} />
        </Routes>
      </Router>
    </Suspense>
  );
};

export default AppRoutes;