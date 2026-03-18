# Guia de APIs para Frontend

Esta guia explica como usar las APIs de App Creator, Flow Engine, Toolbox y Tables desde el frontend. Esta disenada para desarrolladores que necesitan integrar estas APIs en sus aplicaciones web.

## Tabla de Contenidos

- [Conceptos Fundamentales](#conceptos-fundamentales)
- [Autenticacion](#autenticacion)
- [App Creator API](#app-creator-api)
- [Toolbox API - Formularios](#toolbox-api---formularios)
- [Flow Engine API - Flujos](#flow-engine-api---flujos)
- [Tables API - Tablas y Vistas](#tables-api---tablas-y-vistas)

---

## Conceptos Fundamentales

### Formulario

Un formulario es una estructura de datos que define campos, validaciones y configuraciones para capturar informacion de los usuarios. Los formularios se gestionan mediante la API de Toolbox.

**Caracteristicas principales:**

- Campos con diferentes tipos (texto, email, numero, fecha, etc.)
- Secciones para organizar campos
- Validaciones y campos opcionales/requeridos
- Instancias: cada vez que un usuario completa un formulario, se crea una "instancia"
- Soporte para guardar datos automaticamente en tablas

**Ejemplo de uso:**

- Formulario de registro de clientes
- Formulario de reporte de incidentes
- Formulario de solicitud de permisos

### Flujo

Un flujo es una secuencia automatizada de tareas que se ejecutan en orden. Los flujos se gestionan mediante la API de Flow Engine y permiten automatizar procesos de negocio.

**Caracteristicas principales:**

- **Nodos:** representan acciones o eventos (enviar email, ejecutar script, esperar senal, etc.)
- **Edges:** conexiones entre nodos que definen el orden de ejecucion
- **Variables compartidas:** los nodos pueden compartir datos entre si
- **Ejecucion distribuida:** usa Temporal para ejecutar flujos de forma robusta
- Puede pausar y continuar esperando senales externas

**Ejemplo de uso:**

- Flujo que envia un email cuando se completa un formulario
- Flujo que procesa datos y los guarda en una tabla
- Flujo que espera la aprobacion de un usuario antes de continuar

### Tabla

Una tabla es una estructura de datos dinamica en MySQL que almacena informacion en filas y columnas. Las tablas se gestionan mediante la API de Tables.

**Caracteristicas principales:**

- **Creacion dinamica:** puedes crear tablas sin escribir SQL
- **Columnas configurables:** diferentes tipos de datos
- **Columnas calculadas:** operaciones matematicas automaticas
- **CRUD completo:** crear, leer, actualizar y eliminar filas
- **Consultas avanzadas:** filtros, ordenamiento, paginacion, JOINs
- **Multi-tenant:** cada tenant tiene sus propias tablas

**Ejemplo de uso:**

- Tabla de clientes
- Tabla de productos
- Tabla de ventas

### Vista

Una vista es una consulta guardada que permite ver datos de una o mas tablas de forma personalizada. Las vistas se gestionan mediante la API de Tables.

**Caracteristicas principales:**

- **Consultas reutilizables:** guarda consultas complejas con filtros
- **Combinacion de tablas:** puede incluir JOINs entre multiples tablas
- **Columnas personalizadas:** selecciona solo las columnas que necesitas
- **Filtros predefinidos:** aplica condiciones automaticamente

**Ejemplo de uso:**

- Vista de "Clientes Activos" que filtra solo clientes con estado activo
- Vista de "Ventas del Mes" que muestra ventas del mes actual
- Vista de "Productos con Stock Bajo" que combina tablas de productos e inventario

---

## Autenticacion

Todas las APIs requieren autenticacion mediante JWT Bearer Token. Debes incluir el token en el header `Authorization` de todas las peticiones:

```javascript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

---

## App Creator API

La API de App Creator gestiona la estructura de aplicaciones, modulos y elementos (formularios, tablas y flujos).

**Base URL:** `http://nanofreeze.app-creator.ibisagroup.com/api/v1`

### Conceptos Clave

- **App:** Contenedor principal que agrupa modulos
- **Module:** Contenedor dentro de una App que agrupa elementos
- **Element:** Referencia a un formulario, tabla o flujo que pertenece a un modulo

### Endpoints Principales

#### Obtener todas las Apps

```
GET /api/v1/apps
```

#### Obtener una App con sus modulos y elementos

```
GET /api/v1/apps/:id
```

Response example:

```json
{
  "data": {
    "id": 1,
    "name": "Sistema de Incidentes",
    "modules": [
      {
        "id": 1,
        "name": "Gestion Principal",
        "elements": [
          {
            "id": 1,
            "type": "form",
            "identifier": "abc123-def456-ghi789"
          },
          {
            "id": 2,
            "type": "flow",
            "identifier": "123"
          }
        ]
      }
    ]
  }
}
```

#### Crear una App

```
POST /api/v1/apps
```

```json
{
  "name": "Mi Nueva App",
  "description": "Descripcion de la app"
}
```

#### Obtener Elementos con datos completos

```
GET /api/v1/elements?moduleId=1&type=form&fetchData=true
```

---

## Toolbox API - Formularios

La API de Toolbox gestiona formularios, instancias de formularios, notificaciones y usuarios.

**Base URL:** `http://nanofreeze.toolbox.ibisagroup.com/`

### Endpoints Principales

#### Obtener todos los formularios

```
GET /api/v1/forms
```

#### Obtener un formulario especifico

```
GET /api/v1/forms/:formId
```

Response example:

```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Formulario de Contacto",
    "public": false,
    "fields": [
      {
        "name": "Nombre Completo",
        "type_field": "text",
        "key": "nombre_completo",
        "optional": false,
        "value": {
          "value": "",
          "multivalues": [],
          "signatureName": "",
          "tablevalues": [],
          "comment_color": null
        }
      }
    ],
    "sections": ["Informacion Personal", "Contacto"]
  }
}
```

#### Crear un formulario

```
POST /api/v1/forms
```

```json
{
  "name": "Nuevo Formulario",
  "public": false,
  "users_functions": ["admin", "user"],
  "sections": ["Seccion 1", "Seccion 2"],
  "fields": [
    {
      "name": "Campo de Texto",
      "type_field": "text",
      "key": "campo_texto",
      "optional": false,
      "section": 0,
      "value": {
        "value": "",
        "multivalues": [],
        "signatureName": "",
        "tablevalues": [],
        "comment_color": null
      }
    }
  ]
}
```

#### Actualizar un formulario

```
PUT /api/v1/forms/:formId
```

```json
{
  "name": "Formulario Actualizado",
  "public": true,
  "sections": ["Nueva Seccion"]
}
```

#### Eliminar un formulario

```
DELETE /api/v1/forms/:formId
```

```json
{
  "name": "Nombre del Formulario"
}
```

### Instancias de Formularios

Una instancia es una copia de un formulario que un usuario puede completar. Cada vez que se envia un formulario, se crea una instancia.

#### Obtener todas las instancias

```
GET /api/v1/instances?limit=10&offset=0&status=instanced&formId=507f1f77bcf86cd799439011
```

#### Obtener una instancia especifica

```
GET /api/v1/instances/:instanceId
```

#### Crear una instancia

```
POST /api/v1/instances
```

```json
{
  "user": "user123",
  "name": "Nueva Instancia",
  "priority": "normal",
  "form": {
    "_id": "507f1f77bcf86cd799439011",
    "fields": [
      {
        "name": "Campo 1",
        "type_field": "text",
        "key": "campo1",
        "value": {
          "value": "Valor inicial",
          "multivalues": [],
          "signatureName": "",
          "tablevalues": [],
          "comment_color": null
        }
      }
    ]
  }
}
```

#### Actualizar una instancia (completar formulario)

```
PUT /api/v1/instances/:instanceId
```

```json
{
  "status": "received",
  "seen": true,
  "form": {
    "_id": "507f1f77bcf86cd799439011",
    "fields": [
      {
        "name": "Campo 1",
        "type_field": "text",
        "key": "campo1",
        "value": {
          "value": "Valor completado",
          "multivalues": [],
          "signatureName": "",
          "tablevalues": [],
          "comment_color": null
        }
      }
    ]
  }
}
```

---

## Flow Engine API - Flujos

La API de Flow Engine gestiona flujos de trabajo (flows) y sus ejecuciones.

**Base URL:** `http://nanofreeze.flow-engine.ibisagroup.com/api/v1`

### Endpoints Principales

#### Obtener todos los flujos

```
GET /api/v1/flows?limit=30&offset=0&status=active
```

#### Obtener un flujo especifico

```
GET /api/v1/flows/:id
```

#### Crear un flujo

```
POST /api/v1/flows
```

```json
{
  "name": "Notificacion por email",
  "description": "Flujo que envia un email",
  "status": "active",
  "json": {
    "nodes": [
      {
        "id": "start",
        "type": "event",
        "function": "startEvent",
        "signals": {
          "before": false,
          "after": false
        },
        "data": {}
      },
      {
        "id": "email",
        "type": "task",
        "function": "sendEmail",
        "signals": {
          "before": false,
          "after": false
        },
        "data": {
          "to": "{{email}}",
          "subject": "Hola",
          "text": "<p>Este es un email automatico</p>"
        }
      },
      {
        "id": "end",
        "type": "event",
        "function": "endEvent",
        "signals": {
          "before": false,
          "after": false
        },
        "data": {}
      }
    ],
    "edges": [
      {
        "id": "e-start-email",
        "source": "start",
        "target": "email"
      },
      {
        "id": "e-email-end",
        "source": "email",
        "target": "end"
      }
    ]
  }
}
```

#### Actualizar un flujo

```
PATCH /api/v1/flows/:id
```

```json
{
  "name": "Flujo Actualizado",
  "status": "inactive"
}
```

#### Ejecutar un flujo

```
POST /api/v1/flows/:id/execute
```

```json
{
  "variableInicial": "valor",
  "otraVariable": 123
}
```

#### Continuar un flujo pausado

```
POST /api/v1/flows/executions/:executionId/continue
```

```json
{
  "formData": {
    "campo1": "valor1",
    "campo2": "valor2"
  },
  "usuarioId": 123
}
```

### Ejecuciones

Una ejecucion es una instancia de un flujo que se esta ejecutando o ya se ejecuto.

#### Obtener todas las ejecuciones

```
GET /api/v1/executions?limit=30&offset=0
```

#### Obtener una ejecucion especifica

```
GET /api/v1/executions/:id
```

Response example:

```json
{
  "data": {
    "id": 1,
    "flowId": 1,
    "status": "executing",
    "executionVariables": {
      "numero": 42,
      "resultado": 84,
      "email": "test@example.com"
    },
    "workflowId": "flow-1-execution-1-1730288445123"
  }
}
```

---

## Tables API - Tablas y Vistas

La API de Tables gestiona tablas dinamicas, filas, columnas y vistas en MySQL.

**Base URL:** `http://nanofreeze.tables.ibisagroup.com/api/v1`

### Endpoints Principales

#### Obtener todas las tablas

```
GET /api/v1/tables
```

#### Obtener columnas de una tabla

```
GET /api/v1/columns/:table
```

### Operaciones con Filas (CRUD)

#### Obtener filas de una tabla

```
GET /api/v1/rows/:table?limit=100&offset=0
```

#### Consultar filas con filtros avanzados

```
POST /api/v1/rows/query/:table
```

```json
{
  "limit": 100,
  "offset": 0,
  "orders": [
    {
      "orderBy": "id",
      "sortOrder": "DESC"
    }
  ],
  "conditions": [
    {
      "column": "estado",
      "comparator": "=",
      "value": "activo",
      "next": "AND"
    },
    {
      "column": "fecha",
      "comparator": ">",
      "value": "2024-01-01"
    }
  ]
}
```

#### Consultar filas con JOINs

```
POST /api/v1/rows/query-join/:table
```

```json
{
  "limit": 50,
  "offset": 0,
  "joins": [
    {
      "table": "point_of_sale",
      "ons": [
        {
          "table": "clientes",
          "column": "id",
          "equalsTo": {
            "table": "point_of_sale",
            "column": "id_client"
          }
        }
      ]
    }
  ],
  "columns": [
    {
      "table": "clientes",
      "column": "id",
      "alias": "cliente_id"
    },
    {
      "table": "clientes",
      "column": "nombre",
      "alias": "cliente_nombre"
    },
    {
      "table": "point_of_sale",
      "column": "nombre",
      "alias": "pos_nombre"
    }
  ],
  "conditions": [
    {
      "table": "clientes",
      "column": "estado",
      "comparator": "=",
      "value": "activo",
      "next": "AND"
    }
  ],
  "orders": [
    {
      "table": "clientes",
      "orderBy": "id",
      "sortOrder": "ASC"
    }
  ]
}
```

#### Agregar una fila

```
POST /api/v1/rows/:table
```

```json
{
  "nombre": "Juan Perez",
  "email": "juan@example.com",
  "edad": 30
}
```

#### Agregar multiples filas

```
POST /api/v1/rows/:table/many
```

```json
[
  {
    "nombre": "Juan Perez",
    "email": "juan@example.com",
    "edad": 30
  },
  {
    "nombre": "Maria Garcia",
    "email": "maria@example.com",
    "edad": 25
  }
]
```

#### Editar una fila

```
PUT /api/v1/rows/:table/:id
```

```json
{
  "nombre": "Juan Perez Actualizado",
  "email": "juan.nuevo@example.com"
}
```

#### Editar multiples filas

```
PUT /api/v1/rows/:table/many
```

```json
[
  {
    "id": 1,
    "nombre": "Juan Perez Actualizado"
  },
  {
    "id": 2,
    "nombre": "Maria Garcia Actualizada"
  }
]
```

#### Eliminar una fila

```
DELETE /api/v1/rows/:table/:id
```

#### Eliminar multiples filas

```
DELETE /api/v1/rows/:table/many
```

```json
{
  "ids": [1, 2, 3]
}
```

#### Obtener total de filas

```
GET /api/v1/rows/:table/count
```

#### Obtener total de filas filtradas

```
POST /api/v1/rows/query/:table/count
```

```json
{
  "conditions": [
    {
      "column": "estado",
      "comparator": "=",
      "value": "activo",
      "next": "AND"
    }
  ]
}
```
