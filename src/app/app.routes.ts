import { Routes } from '@angular/router';
import { loggedInGuard } from './services/logged-in.guard';
import { Auth } from './pages/auth/auth';
import { Cars } from './pages/cars/cars';
import { Profile } from './pages/profile/profile';
import { Clientfiles } from './pages/clientfiles/clientfiles';
import { ClientfileDetailed } from './pages/clientfile-detailed/clientfile-detailed';
import { Dashboard } from './pages/dashboard/dashboard';
import { CarDetailed } from './pages/car-detailed/car-detailed';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
    },
    {
        path: 'login',
        component: Auth,
        canActivate: [loggedInGuard],
    },
    {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [loggedInGuard],
    },
    {
        path: 'profil',
        component: Profile,
        canActivate: [loggedInGuard],
    },
    {
        path: 'dossiers',
        component: Clientfiles,
        canActivate: [loggedInGuard],
    },
    {
        path: 'dossiers/:id',
        component: ClientfileDetailed,
        canActivate: [loggedInGuard],
    },
    {
        path: 'stock',
        component: Cars,
        canActivate: [loggedInGuard],
    },
    {
        path: 'stock/:id',
        component: CarDetailed,
        canActivate: [loggedInGuard],
    },
    {
        path: '**',
        redirectTo: 'dashboard',
    },
];
