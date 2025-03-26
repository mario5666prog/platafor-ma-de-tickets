import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, PlusCircle, Trash2, Edit, Save, X, LogIn, LogOut, UserPlus, KeyRound, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

// Interfaces
interface Ticket {
    idTicket: string;
    tipoDeTicket: string;
    quienReporta: string;
    fecha: string;
    estatus: string;
    asesorQueAtiende: string;
    empresa: string;
}

interface Empresa {
    nombre: string;
    direccion: string;
    telefono: string;
    correo: string;
    nombreDeContacto: string;
}

interface Asesor {
    nombre: string;
    telefono: string;
    correo: string;
    numeroDeTrabajador: string;
}

interface Cliente {
    nombre: string;
    correo: string;
    empresa: string;
}

interface Usuario {
    id: string;
    nombre: string;
    correo: string;
    contrasena: string;
    rol: 'admin' | 'cliente';
}

// Dummy Data (para desarrollo inicial)
const initialTickets: Ticket[] = [
    { idTicket: '1', tipoDeTicket: 'Soporte', quienReporta: 'Juan Pérez', fecha: '2024-07-24', estatus: 'Abierto', asesorQueAtiende: 'Ana García', empresa: 'Empresa A' },
    { idTicket: '2', tipoDeTicket: 'Incidencia', quienReporta: 'María López', fecha: '2024-07-23', estatus: 'En Proceso', asesorQueAtiende: 'Carlos Rodríguez', empresa: 'Empresa B' },
];

const initialEmpresas: Empresa[] = [
    { nombre: 'Empresa A', direccion: 'Calle Principal 123', telefono: '55-1234-5678', correo: 'info@empresaA.com', nombreDeContacto: 'Juan Pérez' },
    { nombre: 'Empresa B', direccion: 'Avenida Secundaria 456', telefono: '55-9876-5432', correo: 'contacto@empresaB.com', nombreDeContacto: 'María López' },
];

const initialAsesores: Asesor[] = [
    { nombre: 'Ana García', telefono: '55-1122-3344', correo: 'ana.garcia@soporte.com', numeroDeTrabajador: '101' },
    { nombre: 'Carlos Rodríguez', telefono: '55-5566-7788', correo: 'carlos.rodriguez@soporte.com', numeroDeTrabajador: '102' },
];

const initialClientes: Cliente[] = [
    { nombre: 'Juan Pérez', correo: 'juan.perez@cliente.com', empresa: 'Empresa A' },
    { nombre: 'María López', correo: 'maria.lopez@cliente.com', empresa: 'Empresa B' },
];

const initialUsuarios: Usuario[] = [
    { id: '1', nombre: 'Admin User', correo: 'admin@example.com', contrasena: 'admin123', rol: 'admin' },
    { id: '2', nombre: 'Client User', correo: 'client@example.com', contrasena: 'client456', rol: 'cliente' },
];

// Animation Variants
const listItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
};

// Helper Functions
const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

// Components

const CustomButton = ({
    children,
    variant = 'default',
    size = 'default',
    className,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    return (
        <Button
            variant={variant}
            size={size}
            className={cn(
                'rounded-md shadow-md transition-all duration-300',
                variant === 'default' && 'bg-blue-500 hover:bg-blue-600 text-white',
                variant === 'secondary' && 'bg-gray-200 hover:bg-gray-300 text-gray-800',
                variant === 'destructive' && 'bg-red-500 hover:bg-red-600 text-white',
                variant === 'outline' && 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600',
                size === 'sm' && 'px-2 py-1 text-sm',
                size === 'lg' && 'px-6 py-3 text-lg',
                className
            )}
            {...props}
        >
            {children}
        </Button>
    );
};

const TicketForm = ({
    ticket,
    empresas,
    asesores,
    onSave,
    onCancel,
    isEditing
}: {
    ticket: Ticket;
    empresas: Empresa[];
    asesores: Asesor[];
    onSave: (ticket: Ticket) => void;
    onCancel: () => void;
    isEditing: boolean;
}) => {
    const [formData, setFormData] = useState<Ticket>(ticket);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = (data: Ticket) => {
        const newErrors: { [key: string]: string } = {};

        if (!data.tipoDeTicket) newErrors.tipoDeTicket = 'El tipo de ticket es requerido';
        if (!data.quienReporta) newErrors.quienReporta = 'Quién reporta es requerido';
        if (!data.fecha) newErrors.fecha = 'La fecha es requerida';
        if (!data.estatus) newErrors.estatus = 'El estatus es requerido';
        if (!data.asesorQueAtiende) newErrors.asesorQueAtiende = 'El asesor es requerido';
        if (!data.empresa) newErrors.empresa = 'La empresa es requerida';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        if (validateForm(formData)) {
            onSave(formData);
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="tipoDeTicket">Tipo de Ticket</Label>
                    <Input
                        id="tipoDeTicket"
                        name="tipoDeTicket"
                        value={formData.tipoDeTicket}
                        onChange={handleChange}
                        placeholder="Ej. Soporte, Incidencia"
                        className={errors.tipoDeTicket ? 'border-red-500' : ''}
                    />
                    {errors.tipoDeTicket && <p className="text-red-500 text-sm mt-1">{errors.tipoDeTicket}</p>}
                </div>
                <div>
                    <Label htmlFor="quienReporta">Quién Reporta</Label>
                    <Input
                        id="quienReporta"
                        name="quienReporta"
                        value={formData.quienReporta}
                        onChange={handleChange}
                        placeholder="Nombre de quien reporta"
                        className={errors.quienReporta ? 'border-red-500' : ''}
                    />
                    {errors.quienReporta && <p className="text-red-500 text-sm mt-1">{errors.quienReporta}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="fecha">Fecha</Label>
                    <Input
                        id="fecha"
                        type="date"
                        name="fecha"
                        value={formData.fecha}
                        onChange={handleChange}
                        className={errors.fecha ? 'border-red-500' : ''}
                    />
                    {errors.fecha && <p className="text-red-500 text-sm mt-1">{errors.fecha}</p>}
                </div>
                <div>
                    <Label htmlFor="estatus">Estatus</Label>
                    <Select
                        value={formData.estatus}
                        onValueChange={(value) => setFormData({ ...formData, estatus: value })}
                    >
                        <SelectTrigger className={errors.estatus ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Selecciona un estatus" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Abierto">Abierto</SelectItem>
                            <SelectItem value="En Proceso">En Proceso</SelectItem>
                            <SelectItem value="Resuelto">Resuelto</SelectItem>
                            <SelectItem value="Cerrado">Cerrado</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.estatus && <p className="text-red-500 text-sm mt-1">{errors.estatus}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="asesorQueAtiende">Asesor que Atiende</Label>
                    <Select
                        value={formData.asesorQueAtiende}
                        onValueChange={(value) => setFormData({ ...formData, asesorQueAtiende: value })}
                    >
                        <SelectTrigger className={errors.asesorQueAtiende ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Selecciona un asesor" />
                        </SelectTrigger>
                        <SelectContent>
                            {asesores.map((asesor) => (
                                <SelectItem key={asesor.numeroDeTrabajador} value={asesor.nombre}>
                                    {asesor.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.asesorQueAtiende && <p className="text-red-500 text-sm mt-1">{errors.asesorQueAtiende}</p>}
                </div>
                <div>
                    <Label htmlFor="empresa">Empresa</Label>
                    <Select
                        value={formData.empresa}
                        onValueChange={(value) => setFormData({ ...formData, empresa: value })}
                    >
                        <SelectTrigger className={errors.empresa ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Selecciona una empresa" />
                        </SelectTrigger>
                        <SelectContent>
                            {empresas.map((empresa) => (
                                <SelectItem key={empresa.nombre} value={empresa.nombre}>
                                    {empresa.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.empresa && <p className="text-red-500 text-sm mt-1">{errors.empresa}</p>}
                </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
                <CustomButton variant="outline" onClick={onCancel}>
                    <X className="mr-2 h-4 w-4" /> Cancelar
                </CustomButton>
                <CustomButton onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" /> {isEditing ? 'Guardar' : 'Crear'}
                </CustomButton>
            </div>
        </div>
    );
};

const LoginForm = ({ onLogin }: { onLogin: (usuario: Usuario) => void }) => {
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simulación de autenticación (reemplazar con lógica real)
        setTimeout(() => {
            const usuario = initialUsuarios.find(u => u.correo === correo && u.contrasena === contrasena);
            setIsLoading(false);
            if (usuario) {
                onLogin(usuario);
            } else {
                setError('Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
            }
        }, 1000);
    };

    return (
        <Card className="w-[350px] shadow-lg">
            <CardHeader>
                <CardTitle className="text-center text-2xl">Iniciar Sesión</CardTitle>
                <CardDescription className="text-center">
                    Ingresa a la plataforma de gestión de tickets
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="correo">Correo</Label>
                        <Input
                            id="correo"
                            type="email"
                            placeholder="Ingrese su correo"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contrasena">Contraseña</Label>
                        <Input
                            id="contrasena"
                            type="password"
                            placeholder="Ingrese su contraseña"
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            required
                            className="w-full"
                        />
                    </div>
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Iniciando sesión...
                            </>
                        ) : (
                            <>
                                <LogIn className="mr-2 h-4 w-4" /> Iniciar Sesión
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

const RegistroForm = ({ onRegister }: { onRegister: (usuario: Usuario) => void }) => {
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [rol, setRol] = useState<'admin' | 'cliente'>('cliente');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [registroExitoso, setRegistroExitoso] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Validación básica
        if (!nombre || !correo || !contrasena) {
            setError('Todos los campos son requeridos.');
            setIsLoading(false);
            return;
        }

        // Simulación de registro (reemplazar con lógica real)
        setTimeout(() => {
            // Verificar si el correo ya existe
            const correoExistente = initialUsuarios.find(u => u.correo === correo);
            if (correoExistente) {
                setError('Este correo ya está registrado.');
                setIsLoading(false);
                return;
            }

            // Crear nuevo usuario (simulado)
            const nuevoUsuario: Usuario = {
                id: String(initialUsuarios.length + 1), // Simulación de ID
                nombre,
                correo,
                contrasena,
                rol,
            };

            // Agregar a la lista de usuarios (simulado)
            initialUsuarios.push(nuevoUsuario); // Esto NO es persistente

            onRegister(nuevoUsuario); // Llama a la función de registro para actualizar el estado en App
            setIsLoading(false);
            setRegistroExitoso(true); // Establecer el estado de registro exitoso
        }, 1500);
    };

    return (
        <Card className="w-[350px] shadow-lg">
            <CardHeader>
                <CardTitle className="text-center text-2xl">Registro</CardTitle>
                <CardDescription className="text-center">
                    Crea una cuenta para acceder a la plataforma
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                            id="nombre"
                            type="text"
                            placeholder="Ingrese su nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="correo">Correo</Label>
                        <Input
                            id="correo"
                            type="email"
                            placeholder="Ingrese su correo"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contrasena">Contraseña</Label>
                        <Input
                            id="contrasena"
                            type="password"
                            placeholder="Ingrese su contraseña"
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            required
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rol">Rol</Label>
                        <Select onValueChange={(value) => setRol(value as 'admin' | 'cliente')} value={rol}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccione un rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cliente">Cliente</SelectItem>
                                <SelectItem value="admin">Administrador</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {registroExitoso && (
                         <Alert variant="success">
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>Registro Exitoso</AlertTitle>
                            <AlertDescription>
                                Su cuenta ha sido creada exitosamente.
                            </AlertDescription>
                        </Alert>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Registrando...
                            </>
                        ) : (
                            <>
                                <UserPlus className="mr-2 h-4 w-4" /> Registrarse
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

const PerfilUsuarioForm = ({ usuario, onUpdate }: { usuario: Usuario, onUpdate: (usuario: Usuario) => void }) => {
    const [nombre, setNombre] = useState(usuario.nombre);
    const [correo, setCorreo] = useState(usuario.correo);
    const [contrasena, setContrasena] = useState(''); // No precargar la contraseña por seguridad
    const [rol, setRol] = useState(usuario.rol);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [updateExitoso, setUpdateExitoso] = useState(false);

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Validación básica
        if (!nombre || !correo) {
            setError('Nombre y correo son requeridos.');
            setIsLoading(false);
            return;
        }

        // Simulación de actualización (reemplazar con lógica real)
        setTimeout(() => {
            // Crear usuario actualizado
            const usuarioActualizado: Usuario = {
                ...usuario, // Mantener el ID
                nombre,
                correo,
                // Solo actualiza la contraseña si se proporciona una nueva
                contrasena: contrasena ? contrasena : usuario.contrasena,
                rol,
            };
            onUpdate(usuarioActualizado); // Actualiza el estado en App
            setIsLoading(false);
            setUpdateExitoso(true);
        }, 1000);
    };

    return (
        <Card className="w-[350px] shadow-lg">
            <CardHeader>
                <CardTitle className="text-center text-2xl">Perfil de Usuario</CardTitle>
                <CardDescription className="text-center">
                    Actualiza tu información de perfil
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                            id="nombre"
                            type="text"
                            placeholder="Ingrese su nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="correo">Correo</Label>
                        <Input
                            id="correo"
                            type="email"
                            placeholder="Ingrese su correo"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contrasena">Contraseña (Opcional)</Label>
                        <Input
                            id="contrasena"
                            type="password"
                            placeholder="Ingrese su nueva contraseña (opcional)"
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rol">Rol</Label>
                         <Select onValueChange={(value) => setRol(value as 'admin' | 'cliente')} value={rol}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccione un rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cliente">Cliente</SelectItem>
                                <SelectItem value="admin">Administrador</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {updateExitoso && (
                        <Alert variant="success">
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>Perfil Actualizado</AlertTitle>
                            <AlertDescription>
                                Su perfil ha sido actualizado exitosamente.
                            </AlertDescription>
                        </Alert>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Actualizando...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" /> Actualizar Perfil
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

const App = () => {
    const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
    const [empresas] = useState<Empresa[]>(initialEmpresas);
    const [asesores] = useState<Asesor[]>(initialAsesores);
    const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios); // Usar el estado para usuarios
    const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
    const [isCreatingTicket, setIsCreatingTicket] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [usuarioLogueado, setUsuarioLogueado] = useState<Usuario | null>(null);
    const [showRegistro, setShowRegistro] = useState(false);
    const [showPerfil, setShowPerfil] = useState(false);
    const [showEmpresas, setShowEmpresas] = useState(false); // Estado para mostrar la lista de empresas
    const [showAsesores, setShowAsesores] = useState(false);  // Estado para mostrar la lista de asesores
    const [showClientes, setShowClientes] = useState(false);

    // Funciones para manejar tickets
    const handleAddTicket = (newTicket: Ticket) => {
        const ticketToAdd = { ...newTicket, idTicket: String(tickets.length + 1) }; // Generar ID
        setTickets([...tickets, ticketToAdd]);
        setIsCreatingTicket(false);
        setEditingTicketId(null);
    };

    const handleUpdateTicket = (updatedTicket: Ticket) => {
        setTickets(tickets.map(t => t.idTicket === updatedTicket.idTicket ? updatedTicket : t));
        setEditingTicketId(null);
    };

    const handleDeleteTicket = (idTicket: string) => {
        setTickets(tickets.filter(t => t.idTicket !== idTicket));
        setEditingTicketId(null);
    };

    const handleCreateNewTicket = () => {
        setIsCreatingTicket(true);
        setEditingTicketId(null); // Asegurarse de que no esté en modo de edición
    };

    const handleCancelTicket = () => {
        setIsCreatingTicket(false);
        setEditingTicketId(null);
    };

    // Funciones para manejar login/registro/perfil
    const handleLogin = (usuario: Usuario) => {
        setIsLoggedIn(true);
        setUsuarioLogueado(usuario);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUsuarioLogueado(null);
        setShowPerfil(false); // Cerrar el perfil al cerrar sesión
    };

     const handleRegister = (nuevoUsuario: Usuario) => {
        // Actualiza la lista de usuarios.
        setUsuarios([...usuarios, nuevoUsuario]);
        // Inicia sesión automáticamente después del registro (opcional).
        handleLogin(nuevoUsuario);
        setShowRegistro(false); // Cierra el formulario de registro.
    };

    const handleUpdatePerfil = (usuarioActualizado: Usuario) => {
        setUsuarios(usuarios.map((u) => (u.id === usuarioActualizado.id ? usuarioActualizado : u)));
        setUsuarioLogueado(usuarioActualizado);
        setShowPerfil(false); // Opcional: cierra el formulario después de la actualización
    };

    const initialTicket: Ticket = {
        idTicket: '',
        tipoDeTicket: '',
        quienReporta: '',
        fecha: '',
        estatus: '',
        asesorQueAtiende: '',
        empresa: '',
    };

    // Función para renderizar contenido basado en el estado de la aplicación
    const renderContent = () => {
        if (!isLoggedIn) {
            return (
                <div className="flex flex-col items-center justify-center h-full gap-8">
                    <LoginForm onLogin={handleLogin} />
                    <Button variant="outline" onClick={() => setShowRegistro(true)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Registrarse
                    </Button>
                    {showRegistro && (
                        <Dialog open={showRegistro} onOpenChange={setShowRegistro}>
                            <DialogContent>
                                <RegistroForm onRegister={handleRegister} />
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            );
        }

        if (showPerfil) {
             return (
                <div className="flex items-center justify-center h-full">
                    <PerfilUsuarioForm usuario={usuarioLogueado!} onUpdate={handleUpdatePerfil} />
                </div>
            );
        }

        if (showEmpresas) {
            return (
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Lista de Empresas</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Dirección</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead>Correo</TableHead>
                                 <TableHead>Contacto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {empresas.map((empresa, index) => (
                                <TableRow key={index}>
                                    <TableCell>{empresa.nombre}</TableCell>
                                    <TableCell>{empresa.direccion}</TableCell>
                                    <TableCell>{empresa.telefono}</TableCell>
                                    <TableCell>{empresa.correo}</TableCell>
                                    <TableCell>{empresa.nombreDeContacto}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="mt-4">
                        <Button onClick={() => setShowEmpresas(false)}>Volver a Tickets</Button>
                    </div>
                </div>
            )
        }

        if (showAsesores) {
             return (
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Lista de Asesores</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead>Correo</TableHead>
                                <TableHead>Número de Trabajador</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {asesores.map((asesor, index) => (
                                <TableRow key={index}>
                                    <TableCell>{asesor.nombre}</TableCell>
                                    <TableCell>{asesor.telefono}</TableCell>
                                    <TableCell>{asesor.correo}</TableCell>
                                    <TableCell>{asesor.numeroDeTrabajador}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="mt-4">
                         <Button onClick={() => setShowAsesores(false)}>Volver a Tickets</Button>
                    </div>
                </div>
            )
        }

        if (showClientes) {
            return (
              <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Lista de Clientes</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Correo</TableHead>
                                <TableHead>Empresa</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialClientes.map((cliente, index) => (
                                <TableRow key={index}>
                                    <TableCell>{cliente.nombre}</TableCell>
                                    <TableCell>{cliente.correo}</TableCell>
                                    <TableCell>{cliente.empresa}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     <div className="mt-4">
                         <Button onClick={() => setShowClientes(false)}>Volver a Tickets</Button>
                    </div>
                </div>
            )
        }

        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Lista de Tickets</h1>
                    <div className="flex gap-4">
                        <CustomButton onClick={handleCreateNewTicket}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Ticket
                        </CustomButton>
                         {usuarioLogueado?.rol === 'admin' && (
                            <>
                                <CustomButton onClick={() => setShowEmpresas(true)} variant="secondary">
                                    <Building2 className="mr-2 h-4 w-4" /> Empresas
                                </CustomButton>
                                <CustomButton onClick={() => setShowAsesores(true)} variant="secondary">
                                    <KeyRound className="mr-2 h-4 w-4" /> Asesores
                                </CustomButton>
                                 <CustomButton onClick={() => setShowClientes(true)} variant="secondary">
                                    <UserPlus className="mr-2 h-4 w-4" /> Clientes
                                </CustomButton>
                            </>
                        )}
                    </div>
                </div>
                <AnimatePresence>
                    {isCreatingTicket && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Dialog open={isCreatingTicket} onOpenChange={setIsCreatingTicket}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Crear Nuevo Ticket</DialogTitle>
                                        <DialogDescription>
                                            Por favor, complete el formulario para crear un nuevo ticket.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <TicketForm
                                        ticket={initialTicket}
                                        empresas={empresas}
                                        asesores={asesores}
                                        onSave={handleAddTicket}
                                        onCancel={handleCancelTicket}
                                        isEditing={false}
                                    />
                                </DialogContent>
                            </Dialog>
                        </motion.div>
                    )}
                </AnimatePresence>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID Ticket</TableHead>
                            <TableHead>Tipo de Ticket</TableHead>
                            <TableHead>Quién Reporta</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Estatus</TableHead>
                            <TableHead>Asesor</TableHead>
                            <TableHead>Empresa</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence>
                            {tickets.map((ticket) => (
                                <motion.tr
                                    key={ticket.idTicket}
                                    variants={listItemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    <TableCell>{ticket.idTicket}</TableCell>
                                    <TableCell>{ticket.tipoDeTicket}</TableCell>
                                    <TableCell>{ticket.quienReporta}</TableCell>
                                    <TableCell>{formatDate(ticket.fecha)}</TableCell>
                                    <TableCell>{ticket.estatus}</TableCell>
                                    <TableCell>{ticket.asesorQueAtiende}</TableCell>
                                    <TableCell>{ticket.empresa}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <CustomButton
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setEditingTicketId(ticket.idTicket)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </CustomButton>
                                            <CustomButton
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteTicket(ticket.idTicket)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </CustomButton>
                                        </div>
                                    </TableCell>
                                    {editingTicketId === ticket.idTicket && (
                                        <Dialog open={!!editingTicketId} onOpenChange={setEditingTicketId}>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Editar Ticket</DialogTitle>
                                                    <DialogDescription>
                                                        Modifique los detalles del ticket.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <TicketForm
                                                    ticket={ticket}
                                                    empresas={empresas}
                                                    asesores={asesores}
                                                    onSave={handleUpdateTicket}
                                                    onCancel={() => setEditingTicketId(null)}
                                                    isEditing={true}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Barra de navegación */}
            <nav className="bg-white shadow-md p-4 flex justify-between items-center">
                <div className="font-bold text-xl">HelpDesk System</div>
                {isLoggedIn && (
                    <div className="flex gap-4 items-center">
                         <span className="text-gray-700">
                            <span className="font-semibold">Usuario:</span> {usuarioLogueado?.nombre} ({usuarioLogueado?.rol})
                        </span>
                        <Button variant="outline" onClick={() => setShowPerfil(true)}>
                            <UserPlus className="mr-2 h-4 w-4" /> Perfil
                        </Button>
                        <Button variant="destructive" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                        </Button>
                    </div>
                )}
            </nav>

            {/* Contenido principal */}
            <main className="container mx-auto mt-8">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
