# 📅 BookEasely - Documento de Requisitos

**Proyecto:** BookEasely - Appointments + Directorio de Negocios Locales  
**Autor:** Julio  
**Fecha:** Enero 2026  
**Versión:** 1.0

---

# 📋 Índice

1. [Visión General](#1-visión-general)
2. [Usuarios Objetivo](#2-usuarios-objetivo)
3. [Funcionalidades del MVP](#3-funcionalidades-del-mvp)
4. [Modelo de Datos](#4-modelo-de-datos)
5. [User Flows](#5-user-flows)
6. [Modelo de Negocio](#6-modelo-de-negocio)
7. [Métricas Clave](#7-métricas-clave)
8. [Análisis de Competencia](#8-análisis-de-competencia)
9. [Stack Tecnológico](#9-stack-tecnológico)
10. [Roadmap](#10-roadmap)

---

# 1. Visión General

## 1.1 ¿Qué es BookEasely?

**BookEasely** es una plataforma que combina un directorio de negocios locales con un sistema de reservas integrado. Permite a los usuarios encontrar servicios cercanos (barberías, salones, spas, clínicas, etc.) y reservar citas directamente sin salir de la app.

## 1.2 Problema que Resuelve

### Para Usuarios (Clientes)

| Problema | Impacto |
|----------|---------|
| Dificultad para encontrar servicios locales de calidad | Pierden tiempo buscando en múltiples lugares |
| Tener que llamar para hacer citas | Inconveniente, especialmente fuera de horario |
| No saber disponibilidad en tiempo real | Frustración, múltiples llamadas |
| Información desactualizada de negocios | Viajes innecesarios, malas experiencias |

### Para Negocios

| Problema | Impacto |
|----------|---------|
| Dependencia de llamadas telefónicas para agendar | Pérdida de tiempo, citas perdidas |
| Pérdida de clientes por no responder a tiempo | Revenue loss directo |
| No-shows y cancelaciones de última hora | Slots vacíos, dinero perdido |
| Falta de visibilidad online | Clientes potenciales no los encuentran |
| Sistemas de booking complejos o caros | No adoptan tecnología |

## 1.3 Propuesta de Valor

> **"Encuentra. Reserva. Listo."**  
> El Yelp con booking integrado para comunidades hispanas en Florida.

### Propuesta de Valor por Usuario

| Usuario | Propuesta |
|---------|-----------|
| **Cliente** | Encuentra negocios cerca de ti y reserva en segundos, sin llamar |
| **Negocio** | Llena tu agenda automáticamente mientras te enfocas en tu trabajo |

## 1.4 Diferenciadores Clave

1. **Bilingüe nativo** - Español/inglés desde el día 1
2. **Discovery + Booking** - No solo directorio, no solo calendario
3. **Hiperlocal** - Enfoque en Florida primero
4. **Simple y accesible** - Precio y UX para small business
5. **Mobile-first** - Diseñado para smartphones

---

# 2. Usuarios Objetivo

## 2.1 Usuario Final (Cliente)

### Perfil Demográfico
- **Edad:** 25-55 años
- **Ubicación:** Florida (inicialmente South Florida)
- **Idioma:** Hispanohablantes (bilingües o Spanish-first)
- **Dispositivo:** Principalmente smartphone (80%+ mobile)

### Comportamiento
- Buscan servicios locales desde el móvil
- Prefieren no llamar por teléfono
- Valoran conveniencia sobre precio
- Confían en reseñas de otros usuarios
- Usan WhatsApp y redes sociales activamente

### Pain Points
- "No quiero llamar para hacer una cita"
- "Nunca sé si tienen espacio disponible"
- "Los horarios en Google están desactualizados"
- "Quiero ver fotos del trabajo antes de ir"

### Jobs to be Done
1. Encontrar un negocio confiable cerca de mí
2. Ver disponibilidad sin tener que llamar
3. Reservar en el momento que me convenga
4. Recordarme de mis citas
5. Descubrir nuevos lugares buenos

## 2.2 Usuario Negocio (Business Owner)

### Perfil
- **Tipo:** Pequeños y medianos negocios de servicios
- **Empleados:** 1-20 personas
- **Tech-savviness:** Básico a intermedio
- **Ubicación:** Florida

### Industrias Prioritarias (Fase 1)

| Prioridad | Industria | Por qué |
|-----------|-----------|---------|
| P0 | Barberías | Alta demanda, booking simple |
| P0 | Salones de belleza | Múltiples servicios, staff |
| P0 | Nail salons | Muy populares, necesitan organización |
| P1 | Spas y wellness | Ticket alto, booking crítico |
| P1 | Clínicas pequeñas | Dentistas, quiroprácticos |
| P2 | Personal trainers | Citas recurrentes |
| P2 | Tatuadores | Citas largas, depósitos |

### Pain Points
- "Pierdo tiempo contestando llamadas"
- "Los clientes no llegan a sus citas"
- "No tengo sistema, uso papel o WhatsApp"
- "Los programas que hay son muy complicados"
- "Todo está en inglés"

### Jobs to be Done
1. Recibir reservas sin contestar el teléfono
2. Reducir no-shows con recordatorios
3. Ver mi agenda del día fácilmente
4. Conseguir más clientes locales
5. Lucir profesional online

---

# 3. Funcionalidades del MVP

## 3.1 Módulo de Búsqueda y Descubrimiento (Cliente)

### Features Core (P0)

| Feature | Descripción | Criterios de Aceptación |
|---------|-------------|------------------------|
| Búsqueda por categoría | Usuario puede filtrar por tipo de servicio | Lista desplegable con categorías principales |
| Búsqueda por ubicación | Usar GPS o ingresar dirección manualmente | Geolocalización funciona, input de dirección con autocomplete |
| Mapa interactivo | Ver negocios cercanos en mapa | Google Maps con markers, tap para ver info |
| Lista de resultados | Ver negocios en formato lista | Cards con foto, nombre, rating, distancia |
| Perfil de negocio | Página completa del negocio | Fotos, servicios, precios, horarios, ubicación |

### Features Importantes (P1)

| Feature | Descripción | Criterios de Aceptación |
|---------|-------------|------------------------|
| Filtros avanzados | Por precio, rating, disponibilidad hoy | Filtros aplicables y combinables |
| Reseñas y ratings | Ver opiniones de otros clientes | Lista de reseñas con rating promedio |
| Favoritos | Guardar negocios preferidos | Lista de favoritos accesible |
| Búsqueda por texto | Buscar por nombre o servicio | Search bar con resultados instantáneos |

### Features Deseables (P2)

| Feature | Descripción |
|---------|-------------|
| Recomendaciones personalizadas | Basadas en historial |
| Compartir negocio | Via WhatsApp, SMS, etc |
| Fotos de clientes | Galería con trabajos realizados |

## 3.2 Módulo de Reservas (Cliente)

### Features Core (P0)

| Feature | Descripción | Criterios de Aceptación |
|---------|-------------|------------------------|
| Ver disponibilidad | Calendario con slots disponibles | Calendario visual, slots clickeables |
| Seleccionar servicio | Lista de servicios con duración y precio | Servicios con info clara, selección única/múltiple |
| Confirmar reserva | Resumen antes de confirmar | Muestra fecha, hora, servicio, precio total |
| Confirmación email | Email automático al reservar | Email enviado < 1 minuto, incluye detalles |
| Mis citas | Lista de próximas citas | Ordenadas por fecha, con detalles |

### Features Importantes (P1)

| Feature | Descripción | Criterios de Aceptación |
|---------|-------------|------------------------|
| Seleccionar profesional | Elegir empleado específico | Lista de staff disponible, opcional |
| Recordatorio SMS | Mensaje antes de la cita | Configurable por negocio (24h, 2h antes) |
| Cancelar cita | Cancelar según política | Respeta reglas del negocio |
| Reagendar | Cambiar fecha/hora | Muestra nueva disponibilidad |
| Historial de citas | Citas pasadas | Lista con opción de re-reservar |

### Features Deseables (P2)

| Feature | Descripción |
|---------|-------------|
| Waitlist | Anotarse si no hay espacio |
| Pago anticipado | Cobrar depósito o total |
| Citas recurrentes | Reservar semanal/mensual |

## 3.3 Módulo de Negocio (Dashboard)

### Features Core (P0)

| Feature | Descripción | Criterios de Aceptación |
|---------|-------------|------------------------|
| Onboarding wizard | Registro guiado paso a paso | 5-7 pasos claros, progreso visible |
| Perfil del negocio | Editar información pública | Todos los campos editables, preview |
| Gestión de servicios | CRUD de servicios | Crear, editar, eliminar, ordenar |
| Gestión de horarios | Definir días/horas de trabajo | Por día de semana, horarios flexibles |
| Calendario de citas | Ver agenda diaria/semanal | Vista día y semana, citas visibles |
| Ver reserva entrante | Notificación de nueva cita | Push notification + email |
| Confirmar/Rechazar | Gestionar solicitudes | Botones claros, razón si rechaza |

### Features Importantes (P1)

| Feature | Descripción | Criterios de Aceptación |
|---------|-------------|------------------------|
| Gestión de empleados | Agregar staff | Nombre, servicios que ofrece, horario |
| Bloquear horarios | Marcar no disponible | Selección de rango, razón opcional |
| Cancelar cita (negocio) | Cancelar con notificación | Cliente recibe email/SMS |
| Configurar recordatorios | Cuándo enviar reminders | Opciones: 24h, 12h, 2h, 1h antes |
| Galería de fotos | Subir fotos del trabajo | Upload múltiple, reordenar |

### Features Deseables (P2)

| Feature | Descripción |
|---------|-------------|
| Analytics básicos | Citas del mes, no-shows, revenue |
| Notas del cliente | Info privada por cliente |
| Lista de espera | Gestionar waitlist |
| Múltiples ubicaciones | Para cadenas pequeñas |

## 3.4 Módulo de Autenticación

### Features Core (P0)

| Feature | Descripción | Criterios de Aceptación |
|---------|-------------|------------------------|
| Registro cliente | Email/password | Validación, confirmación email |
| Registro con Google | OAuth Google | One-tap en móvil |
| Registro negocio | Formulario completo | Validación de datos de negocio |
| Login | Email/password o social | Ambos tipos de usuario |
| Recuperar contraseña | Via email | Link seguro, expira en 24h |
| Logout | Cerrar sesión | Limpia tokens, redirige |

### Features Importantes (P1)

| Feature | Descripción |
|---------|-------------|
| Login con Apple | OAuth Apple (requerido iOS) |
| Perfil de usuario | Editar nombre, teléfono, foto |
| Verificación de negocio | Badge de verificado |
| Eliminar cuenta | GDPR compliance |

---

# 4. Modelo de Datos

## 4.1 Diagrama Entidad-Relación

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│     users       │         │   businesses    │         │    services     │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ id (PK)         │────┐    │ id (PK)         │────┐    │ id (PK)         │
│ email           │    │    │ owner_id (FK)───│────┘    │ business_id(FK)─│───┐
│ password_hash   │    │    │ name            │         │ name            │   │
│ full_name       │    │    │ slug            │         │ description     │   │
│ phone           │    │    │ description     │         │ duration_min    │   │
│ avatar_url      │    │    │ category_id(FK) │         │ price           │   │
│ role            │    │    │ address         │         │ is_active       │   │
│ language_pref   │    │    │ city, state     │         │ sort_order      │   │
│ created_at      │    │    │ lat, lng        │         │ created_at      │   │
└─────────────────┘    │    │ phone, email    │         └─────────────────┘   │
        │              │    │ logo_url        │                               │
        │              │    │ is_verified     │         ┌─────────────────┐   │
        │              │    │ subscription    │         │     staff       │   │
        │              │    │ created_at      │         ├─────────────────┤   │
        │              │    └─────────────────┘         │ id (PK)         │   │
        │              │            │              ┌────│ business_id(FK) │   │
        │              │            │              │    │ user_id (FK)    │   │
        │              │            ▼              │    │ name            │   │
        │              │    ┌─────────────────┐    │    │ role            │   │
        │              │    │ business_hours  │    │    │ is_active       │   │
        │              │    ├─────────────────┤    │    └─────────────────┘   │
        │              │    │ id (PK)         │    │            │             │
        │              │    │ business_id(FK)─│────┘            │             │
        │              │    │ day_of_week     │                 │             │
        │              │    │ open_time       │                 │             │
        │              │    │ close_time      │                 │             │
        │              │    │ is_closed       │                 │             │
        │              │    └─────────────────┘                 │             │
        │              │                                        │             │
        │              │    ┌─────────────────┐                 │             │
        │              │    │  appointments   │                 │             │
        │              │    ├─────────────────┤                 │             │
        │              └───▶│ id (PK)         │                 │             │
        │                   │ business_id(FK)─│─────────────────┘             │
        └──────────────────▶│ client_id (FK)  │                               │
                            │ service_id (FK)─│───────────────────────────────┘
                            │ staff_id (FK)   │
                            │ date            │
                            │ start_time      │
                            │ end_time        │
                            │ status          │
                            │ notes           │
                            │ created_at      │
                            └─────────────────┘

┌─────────────────┐         ┌─────────────────┐
│   categories    │         │    reviews      │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │         │ id (PK)         │
│ name            │         │ business_id(FK) │
│ name_es         │         │ client_id (FK)  │
│ slug            │         │ appointment_id  │
│ icon            │         │ rating (1-5)    │
│ parent_id (FK)  │         │ comment         │
│ sort_order      │         │ response        │
└─────────────────┘         │ created_at      │
                            └─────────────────┘
```

## 4.2 Tablas Principales (SQL)

### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'client', -- 'client', 'business_owner', 'staff', 'admin'
    language_pref VARCHAR(5) DEFAULT 'es', -- 'es', 'en'
    email_verified BOOLEAN DEFAULT FALSE,
    google_id VARCHAR(255),
    apple_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### businesses
```sql
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) DEFAULT 'FL',
    zip_code VARCHAR(10) NOT NULL,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    website VARCHAR(500),
    logo_url TEXT,
    cover_url TEXT,
    photos TEXT[],
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    subscription VARCHAR(20) DEFAULT 'free',
    subscription_ends_at TIMESTAMP WITH TIME ZONE,
    stripe_customer_id VARCHAR(255),
    avg_rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### appointments
```sql
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    client_id UUID REFERENCES users(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', 
    -- 'pending', 'confirmed', 'cancelled_by_client', 'cancelled_by_business', 'completed', 'no_show'
    notes TEXT,
    client_notes TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

# 5. User Flows

## 5.1 Cliente: Buscar y Reservar

```
[1. Abrir App]
     │
     ▼
[2. Home: Mapa + Lista de negocios cercanos]
     │
     ▼
[3. Filtrar por categoría (ej: "Barberías")]
     │
     ▼
[4. Ver resultados en mapa/lista]
     │
     ▼
[5. Tap en negocio] ──▶ [Ver perfil completo]
     │                    - Fotos
     │                    - Servicios con precios
     │                    - Horarios
     │                    - Reseñas
     ▼
[6. Seleccionar servicio]
     │
     ▼
[7. Ver calendario con disponibilidad]
     │
     ▼
[8. Seleccionar fecha y hora]
     │
     ▼
[9. Revisar resumen] ──▶ [Confirmar reserva]
     │
     ▼
[10. Confirmación]
     │
     ├──▶ Email de confirmación enviado
     ├──▶ Cita aparece en "Mis Citas"
     └──▶ Recordatorio programado (24h antes)
```

## 5.2 Negocio: Onboarding

```
[1. Landing page] ──▶ [Click "Registrar mi negocio"]
     │
     ▼
[2. Crear cuenta (email/password)]
     │
     ▼
[3. Onboarding Wizard]
     │
     ├── Paso 1: Info básica (nombre, categoría, dirección)
     ├── Paso 2: Logo y fotos
     ├── Paso 3: Agregar servicios (nombre, duración, precio)
     ├── Paso 4: Configurar horarios de trabajo
     └── Paso 5: Vista previa y publicar
     │
     ▼
[4. Dashboard listo] ──▶ [Perfil visible en búsquedas]
```

## 5.3 Negocio: Gestionar Nueva Cita

```
[Nueva reserva llega]
     │
     ├──▶ [Push notification]
     └──▶ [Email notification]
            │
            ▼
     [Ver detalles de cita]
     - Cliente: nombre, teléfono
     - Servicio seleccionado
     - Fecha y hora
     - Notas del cliente
            │
     ┌──────┴──────┐
     ▼             ▼
[Confirmar]   [Rechazar]
     │             │
     ▼             ▼
Cliente        Cliente notificado
notificado     Slot liberado
Cita en 
calendario
```

---

# 6. Modelo de Negocio

## 6.1 Planes de Suscripción

| Plan | Precio | Citas/mes | Staff | Features |
|------|--------|-----------|-------|----------|
| **Free** | $0 | 50 | 1 | Perfil básico, calendario, email notifications |
| **Starter** | $29/mes | 200 | 3 | + SMS reminders, analytics básicos, sin marca BookEasely |
| **Pro** | $49/mes | Ilimitadas | 10 | + Múltiples ubicaciones, API, soporte prioritario |
| **Enterprise** | Custom | Ilimitadas | Ilimitado | + White-label, integraciones custom |

## 6.2 Revenue Adicional

| Stream | Descripción | Precio |
|--------|-------------|--------|
| Boost de visibilidad | Aparecer primero en búsquedas | $10-20/mes |
| Comisión por reserva | % por cada cita (opt-in) | 2-3% |
| SMS adicionales | Paquetes de SMS extra | $5/100 SMS |

## 6.3 Unit Economics

| Métrica | Valor Esperado |
|---------|----------------|
| CAC | $15-25 |
| LTV | $200-400 |
| LTV:CAC | 8-16x |
| Churn mensual | 5-8% |
| MRR promedio/negocio | $35 |

---

# 7. Métricas Clave

## 7.1 KPIs del Producto

| Métrica | Target MVP (3 meses) |
|---------|----------------------|
| Negocios registrados | 100 |
| Usuarios registrados | 1,000 |
| Citas completadas/mes | 500 |
| Búsqueda → Reserva | > 5% |
| Show rate | > 85% |

## 7.2 KPIs de Negocio

| Métrica | Target 6 meses |
|---------|----------------|
| MRR | $3,000 |
| Negocios pagos | 50 |
| Conversion Free→Paid | > 10% |
| Retention mensual | > 80% |
| NPS | > 40 |

---

# 8. Análisis de Competencia

## 8.1 Competidores

| Competidor | Fortaleza | Debilidad | Nuestra Ventaja |
|------------|-----------|-----------|-----------------|
| **Yelp** | Gran base de usuarios | No tiene booking | Booking integrado |
| **Calendly** | Excelente UX | No es directorio local | Discovery + booking |
| **Fresha** | Gratis, completo | Solo beauty | Multi-industria |
| **Vagaro** | Muy completo | Complejo, caro | Simple, bilingüe |
| **Square Appointments** | Pagos integrados | No discovery | Discovery local |

## 8.2 Nuestra Diferenciación

1. **Bilingüe nativo** (ES/EN) desde el día 1
2. **Discovery + Booking** combinados
3. **Hiperlocal** (Florida primero)
4. **Precio accesible** ($29-49 vs $49-200+)
5. **Mobile-first, simple**

---

# 9. Stack Tecnológico

## 9.1 Core Stack

| Capa | Tecnología |
|------|------------|
| Frontend Web | Next.js 14+ |
| Frontend Mobile | React Native + Expo |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand |
| Backend | Supabase |
| Database | PostgreSQL |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Maps | Google Maps API |
| Payments | Stripe |
| Email | Resend |
| SMS | Twilio |
| Hosting | Vercel |

## 9.2 Integraciones

- Google Maps API (mapas, lugares, geocoding)
- Google/Apple Sign In
- Stripe (subscriptions)
- Twilio (SMS)
- Resend (emails transaccionales)

---

# 10. Roadmap

## 10.1 Fases

### Fase 1: MVP Core (8 semanas)
- Setup proyecto, DB, Auth
- Onboarding negocio, servicios, horarios
- Búsqueda/mapa, perfiles públicos
- Sistema de reservas
- Notificaciones email

### Fase 2: Enhancement (4 semanas)
- SMS reminders
- Reviews y ratings
- App móvil básica

### Fase 3: Monetización (4 semanas)
- Stripe integration
- Planes de pago
- Analytics para negocios

## 10.2 Milestones

| Milestone | Fecha | Criterio |
|-----------|-------|----------|
| Alpha | Semana 6 | 10 negocios de prueba |
| Beta | Semana 10 | 30 negocios, 100 citas |
| Launch | Semana 14 | 100 negocios, primeros pagos |

---

# 📎 Anexos

## A. Categorías Iniciales
- Barberías
- Salones de Belleza
- Spas & Wellness
- Nail Salons
- Clínicas Dentales
- Clínicas Médicas
- Personal Trainers
- Tatuadores

## B. Estados de Cita
- `pending` - Esperando confirmación
- `confirmed` - Confirmada
- `cancelled_by_client` - Cliente canceló
- `cancelled_by_business` - Negocio canceló
- `completed` - Realizada
- `no_show` - Cliente no llegó

---

*Documento creado: Enero 2026*  
*Versión: 1.0*
