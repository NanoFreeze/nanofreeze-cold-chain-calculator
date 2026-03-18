# Flujos, Formularios y Tablas

> Fuente: `Flujos, Formularios y Tablas.xlsx`

---

## Flujos

### Flujo 7: Crear Cliente

- **Ejecucion:** Manual (Portal)
- **Formulario:** Si
- **Tablas afectadas:** Client
- **Descripcion:** Para el portal de nano freeze se habilita la opcion de crear un cliente donde desplegara un formulario con el nombre, el estado (Activo/Inactivo), e internamente el sistema debe crear un id unico para ese cliente. Estos datos deben guardarse en la tabla "Clients"

### Flujo 8: Modificar Cliente

- **Ejecucion:** Manual (Portal)
- **Formulario:** Si
- **Tablas afectadas:** Client
- **Descripcion:** Para el portal de nano freeze se habilita la opcion de modificar un cliente donde desplegara un formulario con los datos del nombre, el estado (Activo/Inactivo), e internamente el sistema debe actualizar ese cliente por su id unico. Estos datos deben actualizarce en la tabla "Clients"

### Flujo 11: Crear Contacto

- **Ejecucion:** Manual (Portal)
- **Formulario:** Si
- **Tablas afectadas:** Customer_Contact
- **Descripcion:** Para el portal de nano freeze se habilita la opcion de agregar un contacto donde desplegara un formulario con el nombre, cargo, telefono y correo e internamente el sistema debe crear un id unico para ese contacto y asociarlo al id del cliente. Estos datos deben guardarse en la tabla "Customers_Clients"

### Flujo 12: Modificar Contacto

- **Ejecucion:** Manual (Portal)
- **Formulario:** Si
- **Tablas afectadas:** Customer_Contact
- **Descripcion:** Para el portal de nano freeze se habilita la opcion de modificar un contacto donde desplegara un formulario con los datos del nombre, cargo, telefono y correo e internamente el sistema debe actualizar ese contacto por su id unico. Estos datos deben guardarse en la tabla "Customers_Clients"

### Flujo 9: Crear Punto de Venta

- **Ejecucion:** Manual (Portal)
- **Formulario:** Si
- **Tablas afectadas:** Point_of_Sale
- **Descripcion:** Para el portal de nano freeze se habilita la opcion de crear un punto de venta donde desplegara un formulario con el nombre del punto de venta, el estado (Activo/Inactivo), el tipo de industria, la localizacion (Latitud y longitud), el costo de la energia, el tipo de moneda, la tasa de cobro y el factor de emision de co2, e internamente el sistema debe crear un id unico para ese punto de venta y ademas asociarlo al id del cliente. Estos datos deben guardarse en la tabla "Point_of_Sale"

### Flujo 10: Modificar Punto de Venta

- **Ejecucion:** Manual (Portal)
- **Formulario:** Si
- **Tablas afectadas:** Point_of_Sale
- **Descripcion:** Para el portal de nano freeze se habilita la opcion de modificar un punto de venta donde desplegara un formulario con los datos del nombre del punto de venta, el estado (Activo/Inactivo), el tipo de industria, la localizacion (Latitud y longitud), el costo de la energia, el tipo de moneda, la tasa de cobro y el factor de emision de co2, e internamente el sistema debe actualizarlo por su id unico. Estos datos deben guardarse en la tabla "Point_of_Sale"

### Flujo 13: Crear Dispositivo

- **Ejecucion:** Manual (Portal)
- **Formulario:** Si
- **Tablas afectadas:** Device
- **Descripcion:** Para el portal de nano freeze se habilita la opcion de agregar un dispositivo donde desplegara un formulario con el nombre del dispositivo, el estado (Online/Offline, por defecto offline), el tipo de dispositivo (Nevera o chiller), el tipo de producto (perecedero/no perecedero), un tipo switch que debe marcar si tiene la capacidad de medir energia, un tipo switch que debe marcar si tiene la capacidad de medir temperatura, e internamente el sistema debe crear un id unico para ese dispositivo y ademas asociarlo al id del punto de venta. Estos datos deben guardarse en la tabla "Device"

### Flujo 14: Modificar Dispositivo

- **Ejecucion:** Manual (Portal)
- **Formulario:** Si
- **Tablas afectadas:** Device
- **Descripcion:** El usuario podra modificar algunas configuraciones del dispositivo IoT a travez de un formulario que se despliega. Y esto modifica y guarda los valores en la tabla Device

### Flujo 15: Programacion de no apagado

- **Ejecucion:** Manual (Portal)
- **Formulario:** Si
- **Tablas afectadas:** Non_Shutdown_Schedule
- **Descripcion:** El usuario programa un horario no apagado llenando un formulario con etiqueta, dia y hora de incio, dia y hora de fin. Envia estos datos al dispositivo y espera confirmacion. Paralelamente debe agregar el horario a la tabla "non-shutdown schedule" y modificarla si hay confirmacion

### Flujo 5: Desconexion de dispositivo

- **Ejecucion:** Automatico IoT
- **Formulario:** No
- **Tablas afectadas:** Alarms
- **Descripcion:** El sistema debe detectar cuando un dispositivo IoT se desconecte de la nube y enviar una notificacion cada dia hasta por 5 dias, aumentando el nivel de criticidad. Estos datos deben guardase en la tabla de alarms

### Flujo 6: Conexion de dispositivo

- **Ejecucion:** Automatico IoT
- **Formulario:** No
- **Tablas afectadas:** Alarms
- **Descripcion:** El sistema debe detectar cuando un dispositivo IoT se vuelve a conectar a la nube. Estos datos deben guardase en la tabla de alarms

### Deteccion de ciclo de enfriamiento prolongado

- **Ejecucion:** Automatico
- **Formulario:** No
- **Tablas afectadas:** Alarms
- **Descripcion:** El sistema debe detectar cuando un ciclo de enfriamiento (Compresor encendido y mayor consumo de potencia) lleva mas de 10 horas y no realiza un apagado

### Deteccion de recurrencia de alarmas de enfriamiento

- **Ejecucion:** Automatico
- **Formulario:** No
- **Tablas afectadas:** Alarms
- **Descripcion:** El sistema debe detectar cuando han habido muchas alarmas por ciclo de enfriamiento seguidas en periodos muy cortos (Periodo de 1-2 dias)

### Calculo de linea base por dispositivo

- **Ejecucion:** Manual (Portal)
- **Formulario:** No
- **Tablas necesarias:** DB_Variable
- **Tablas afectadas:** Device, Data_Base_Line, Period_pos, Period_device
- **Formula:** `linea_base = energia_consumida_final - energia_consumida_inicial`
- **Descripcion:** Para correr este flujo nanofreeze debe asegurarse que el dispositivo este enlazado y online. El usuario podra comenzar el calculo y este deberia ir contando dias hasta completar 30 conteos, (Verificar que hayan suficientes datos) luego de esos 30 dias se hace la resta entre el valor de la energia acumulada inicial y el valor de la energia acumulada final. De esta forma se define el valor de la linea base y se guarda este valor en la tabla "Device". Adicionalmente el registro historico de los 30 dias se guardara en la tabla Data_Base_line. Tambien debe registrar al final el inicio del periodo de cobro del dispositivo y el punto de venta verificando si existe o no

### Actualizacion de linea base

- **Ejecucion:** Automatico mensual
- **Formulario:** No
- **Tablas necesarias:** DB_Variable, Data_Base_Line
- **Tablas afectadas:** Device
- **Formula:** `New_linea_base = m * linea_base_original + b`
- **Descripcion:** Al iniciar el siguiente mes de corte el sistema debe tomar las ventanas de tiempo del mes transcurrido de la DB_Variable y compararlas con las ventanas de tiempo de la tabla Data_Base_Line y con eso hacer las operaciones para la regresion lineal. Con esa regresion lineal hallar la nueva linea base y sobre escribirla en la tabla Device

### Flujos 16, 17: Backup de variables

- **Ejecucion:** Automatico diario
- **Formulario:** No
- **Tablas necesarias:** DB_Variable
- **Tablas afectadas:** History_Hour_Variable
- **Formulas:**
  - `temperatura = sum(muestras_temperatura) / #muestras`
  - `energia_consumida = sum(muestras_consumo_energetico) / #muestras`
- **Descripcion:** El sistema debe traer cada media hora el promedio de las variables de temperatura y consumo energetico de dynamo y guardarlas en la tabla History_Hour_Variable

### Flujos 19, 20: Calculo diario por equipo

- **Ejecucion:** Automatico diario
- **Formulario:** No
- **Tablas necesarias:** DB_Variable, Device, Point_of_Sale
- **Tablas afectadas:** History_Day_Device
- **Formulas:**
  - `temperatura_dia = sum(muestras_temperatura_dia) / #muestras`
  - `energia_consumida_dia = sum(muestras_energia_consumida_dia) / #muestras`
  - `energia_ahorrada_dia = linea_base_equipo - energia_consumida_dia`
  - `co2_evitado_dia = energia_ahorrada_dia * Factor_emision_co2`
  - `dinero_ahorrado_dia = energia_ahorrada_dia * costo_energia`
- **Descripcion:** El sistema debe calcular el promedio del dia de las variables de temperatura y consumo energetico de dynamo, adicionalmente con el promedio de consumo diario y con la linea base del equipo debe calcular la energia ahorrada, Tambien debe traer los datos del factor de co2 y el precio de la energia del punto de venta y con ello calcular el co2 ahorrado y el dinero ahorrado. Todos los calculos deben guardarse en la tabla History_Day_Device.

### Flujo 21: Registrar el periodo de equipo

- **Ejecucion:** Automatico mensual
- **Formulario:** No
- **Tablas afectadas:** Period_Device
- **Descripcion:** Cuando termina de calcular la linea base del equipo se activa y Mensualmente el sistema debe registrar la fecha de inicio y corte del dispositivo e incrementar el valor contador de periodo de la tabla Period_Device

### Flujo 22: Calculo mensual por equipo

- **Ejecucion:** Automatico mensual
- **Formulario:** No
- **Tablas necesarias:** Period_Device, History_Day_Device, Device, Point_of_Sale
- **Tablas afectadas:** History_Period_Device
- **Formulas:**
  - `temperatura_period = sum(temperatura_dias) / #dias`
  - `energia_consumida_period = sum(energia_consumida_dias)`
  - `energia_ahorrada_period = linea_base_equipo - energia_consumida_period`
  - `co2_evitado_period = energia_ahorrada_period * Factor_emision_co2`
  - `dinero_ahorrado_period = energia_ahorrada_period * costo_energia`
- **Descripcion:** El sistema debe calcular el promedio mensual de las variables de temperatura y consumo energetico de la tabla "History_Day_Device", adicionalmente con el promedio de consumo del periodo mensual y con la linea base del equipo debe calcular la energia ahorrada, Tambien debe traer los datos del factor de co2 y el precio de la energia del punto de venta y con ello calcular el co2 ahorrado y el dinero ahorrado del mes. Todos los calculos deben guardarse en la tabla History_Period_Device.

### Flujos 23, 24: Calculo diario por punto de venta

- **Ejecucion:** Automatico diario
- **Formulario:** No
- **Tablas necesarias:** Point_of_Sale, Device, History_Day_Device
- **Tablas afectadas:** History_Day_POS
- **Formulas:**
  - `energia_consumida_pos_dia = sum(energia_consumida_dispositivo)`
  - `energia_ahorrada_pos_dia = sum(energia_ahorrada_dispositivos)`
  - `co2_evitado_pos_dia = sum(co2_evitado_dispositivo)`
  - `dinero_ahorrado_pos_dia = sum(dinero_ahorrado_dispositivo)`
- **Descripcion:** El sistema debe calcular el consumo energetico, la energia ahorrada, el co2 ahorrado y el dinero ahorrado haciendo una suma de los valores de cada equipo que esta asociado al punto de venta y que se encuentran registrados en la tabla History_Day_Device. Todos los calculos deben guardarse con ano, mes y dia en la tabla History_Day_POS.

### Flujo 25: Registrar el periodo de punto de venta

- **Ejecucion:** Automatico mensual
- **Formulario:** No
- **Tablas afectadas:** Period_POS
- **Descripcion:** Mensualmente el sistema debe registrar la fecha de inicio y corte del punto de venta e incrementar el valor contador de periodo de la tabla Period_POS. Tambien debe activar el flujo de generar factura.

### Flujo 26: Calculo mensual por punto de venta

- **Ejecucion:** Automatico mensual
- **Formulario:** No
- **Tablas necesarias:** Period_POS, History_Day_POS
- **Tablas afectadas:** History_Period_POS
- **Formulas:**
  - `energia_consumida_pos_p = sum(energia_consumida_pos_dia)`
  - `energia_ahorrada_pos_p = sum(energia_ahorrada_pos_dia)`
  - `co2_evitado_pos_p = sum(co2_evitado_dispositivo_pos_dia)`
  - `dinero_ahorrado_pos_p = sum(dinero_ahorrado_dispositivo_pos_dia)`
- **Descripcion:** El sistema debe calcular el consumo energetico, la energia ahorrada, el co2 ahorrado y el dinero ahorrado haciendo un promedio de los valores de cada equipo que esta asociado al punto de venta y que se encuentran registrados en la tabla History_Day_POS. El rango definido del periodo evaluado estara dado por la tabla "Period_POS". Los datos se guardaran en la tabla History_Period_POS.

### Flujos 27, 28: Calculo diario por cliente

- **Ejecucion:** Automatico diario
- **Formulario:** No
- **Tablas necesarias:** Point_of_Sale, History_Day_POS
- **Tablas afectadas:** History_Day_Client
- **Formulas:**
  - `energia_consumida_cli_dia = sum(energia_consumida_pos)`
  - `energia_ahorrada_cli_dia = sum(energia_ahorrada_pos)`
  - `co2_evitado_cli_dia = sum(co2_evitado_pos)`
  - `dinero_ahorrado_cli_dia = sum(dinero_ahorrado_pos)`
- **Descripcion:** El sistema debe calcular el consumo energetico, la energia ahorrada, el co2 ahorrado y el dinero ahorrado haciendo una suma de los valores de cada punto de venta que estan asociados al cliente y que se encuentran registrados en la tabla History_Day_POS. Todos los calculos deben guardarse con ano, mes y dia en la tabla History_Day_Client.

### Flujo 29: Calcular Reporte Administrativo

- **Ejecucion:** Automatico mensual
- **Formulario:** No
- **Tablas necesarias:** Period_POS, History_Period_POS, Point_of_Sale, Client
- **Tablas afectadas:** Administrative_Report
- **Formula:** `cobro = energia_ahorrada * costo_energia * tarifa_cobro`
- **Descripcion:** El sistema debe generar cada mes la factura en la fecha fin de corte del periodo del punto de venta, este dato se obtiene de la tabla Period_POS, Y debe traer los valores de energia ahorrada en el periodo, tasa del cobro del punto de venta, tarifa de energia del punto de venta, tipo de moneda y guardarlos en la tabla de Administrative_Report. Ademas con esos datos debe calcular el total a pagar segun la formula establecida y guardarlo en la misma tabla y marcarlo como aun no pagado

### Envio de factura

- **Ejecucion:** Automatico mensual
- **Formulario:** No
- **Tablas necesarias:** Period_POS, History_Period_POS, Administrative_Report, Point_of_Sale, Client, Customer_Contact
- **Descripcion:** Una vez se genera el reporte, se debe generar el pdf del reporte con los datos de las tablas Period_POS, History_Period_POS y Administrative_Report y enviarlo a los contactos del cliente que esten autorizados en la tabla Customer_Contact

### Flujo 4: Inicializar dispositivo

- **Ejecucion:** Con el IoT
- **Formulario:** No
- **Tablas necesarias:** device
- **Descripcion:** Recibir el identificador de device y verificar si esta en la tabla device. si ese id esta en la tabla entonces debe enviar por un topico mqtt con los datos necesarios de configuracion de IoT

---

## Formularios

### Crear cliente (`69a4716f0017e9c39854fe66`)

Permite a Nano Freeze crear un nuevo cliente.

| Campo | Tipo | Opciones |
|-------|------|----------|
| Codigo del cliente | Text | — |
| Nombre del cliente | Text | — |
| Estado | Select | Activo (default), Inactivo |

### Crear punto de venta (`69a275ee0017e9c39854fd8b`)

Permite a Nano Freeze crear un nuevo punto de venta para un cliente.

| Campo | Tipo | Opciones |
|-------|------|----------|
| ID del cliente | Text | — |
| Codigo del punto de venta | Text | — |
| Nombre del punto de venta | Comentario | — |
| Estado | Select | Activo (default), Inactivo |
| Tipo de industria | Text | — |
| Latitud | Number | — |
| Longitud | Number | — |
| Locacion | Text | — |
| Costo de la energia | Number | — |
| Tipo de moneda | Select | COP (default), USD, EUR, MXN |
| Porcentaje de tasa de cobro | Number | — |
| Factor de emision de CO2 | Number | — |

### Crear Dispositivo (`69a663d90017e9c39855081c`)

Permite a Nano Freeze agregar un nuevo dispositivo en el sistema.

| Campo | Tipo | Opciones |
|-------|------|----------|
| ID del punto de venta | Comentario | — |
| Codigo del dispositivo | Text | — |
| Nombre del dispositivo | Text | — |
| Tipo de dispositivo | Select | Nevera, Chiller |
| Tipo de producto | Select | Perecedero, No perecedero |
| Capacidad de medir energia | Select | True, False |
| Capacidad de medir temperatura | Select | True, False |
| Temperatura maxima | Number | — |
| Temperatura minima | Number | — |
| Limite de apagado | Number | — |

### Crear contacto (`69a65d5c0017e9c398550770`)

Permite a Nano Freeze agregar un nuevo contacto asociado al cliente.

| Campo | Tipo | Opciones |
|-------|------|----------|
| ID del cliente | Comentario | — |
| Nombre del contacto | Text | — |
| Cargo | Text | — |
| Telefono | Number | — |
| Correo | Text | — |
| Recibe notificaciones | Select | Si (default), No |

### Programar No Apagado (`69a773a143f358c136c6fd9e`)

Permite a Nano Freeze o al cliente agregar un horario de no apagado de un dispositivo.

| Campo | Tipo | Opciones |
|-------|------|----------|
| ID del dispositivo | Comentario | — |
| Etiqueta | Text | — |
| Tipo de programacion | Smart select | Especifica (default), Semanal |
| Hora inicio | Number | — |
| Hora fin | Number | — |
| Dias de la semana | Select Multi | Lunes - Domingo |
| Dia inicio | Date | — |
| Dia fin | Date | — |

### Modificar cliente (`69a5d9080017e9c39855007d`)

Permite a Nano Freeze modificar un cliente.

| Campo | Tipo | Opciones |
|-------|------|----------|
| ID del cliente | Comentario | — |
| Codigo del cliente | Text | — |
| Nombre del cliente | Text | — |
| Estado | Select | Activo (default), Inactivo |

### Modificar punto de venta (`69a5ed960017e9c3985500d2`)

Permite a Nano Freeze modificar un punto de venta para un cliente.

| Campo | Tipo | Opciones |
|-------|------|----------|
| ID del cliente | Comentario | — |
| ID del punto de venta | Comentario | — |
| Codigo del punto de venta | Text | — |
| Nombre del punto de venta | Text | — |
| Estado | Select | Activo (default), Inactivo |
| Tipo de industria | Text | — |
| Latitud | Number | — |
| Longitud | Number | — |
| Locacion | Texto | — |
| Costo de la energia | Number | — |
| Tipo de moneda | Select | COP (default), USD, EUR, MXN |
| Porcentaje de tasa de cobro | Number | — |
| Factor de emision de CO2 | Number | — |

### Modificar Dispositivo (`69a663f10017e9c398550830`)

Permite a Nano Freeze modificar dispositivo en el sistema.

| Campo | Tipo | Opciones |
|-------|------|----------|
| ID del dispositivo | Comentario | — |
| ID del punto de venta | Comentario | — |
| Codigo del dispositivo | Texto | — |
| Nombre del dispositivo | Text | — |
| Tipo de dispositivo | Select | Nevera, Chiller |
| Tipo de producto | Select | Perecedero, No perecedero |
| Capacidad de medir energia | Select | True, False |
| Capacidad de medir temperatura | Select | True, False |
| Temperatura maxima | Number | — |
| Temperatura minima | Number | — |
| Limite de apagado | Number | — |

### Modificar contacto (`69a65d720017e9c39855077a`)

Permite a Nano Freeze Modificar un contacto asociado al cliente.

| Campo | Tipo | Opciones |
|-------|------|----------|
| ID del contacto | Comentario | — |
| ID del cliente | Comentario | — |
| Nombre del contacto | Text | — |
| Cargo | Text | — |
| Telefono | Number | — |
| Correo | Text | — |
| Recibe notificaciones | Select | Si (default), No |

---

## Tablas

### clients

Almacena la informacion basica de los clientes del sistema. Permite identificar de forma unica a cada cliente.

| Columna | Tipo | Restricciones | Descripcion |
|---------|------|---------------|-------------|
| id_client | INT | PK, UNIQUE, NOT NULL | Identificador unico del cliente. Clave primaria de la tabla. |
| client_code | VARCHAR(20) | UNIQUE, NOT NULL | Codigo unico del cliente. |
| name | VARCHAR(255) | UNIQUE, NOT NULL | Nombre del cliente. No se permiten duplicados. |
| status | ENUM('Active','Inactive') | NOT NULL | Estado del cliente en el sistema. |
| created_at | TIMESTAMP | NULL | Fecha y hora de creacion. |
| update_at | TIMESTAMP | NULL | Fecha y hora de actualizacion. |

### point_of_sale

Tabla que almacena la informacion de los puntos de venta asociados a un cliente.

| Columna | Tipo | Restricciones | Descripcion |
|---------|------|---------------|-------------|
| id_point_of_sale | INT | PK, UNIQUE, NOT NULL, AUTO_INCREMENT | Identificador unico del punto de venta. |
| id_client | INT | FK, NOT NULL | Referencia a Clients.id_client. |
| pos_code | VARCHAR(20) | UNIQUE, NOT NULL | Codigo unico del punto de venta. |
| name_pos | VARCHAR(255) | NOT NULL | Nombre del punto de venta. |
| status | ENUM('Active','Inactive') | NOT NULL | Estado del punto de venta. |
| type_industry | VARCHAR(100) | NOT NULL | Tipo de industria o sector economico. |
| base_line | DECIMAL(12,4) | NULL | Linea base de consumo energetico (kWh). |
| baseline_calculation_start | DATE | NULL | Fecha de inicio del calculo de linea base. |
| baseline_calculation_end | DATE | NULL | Fecha de fin del calculo de linea base. |
| latitude | DECIMAL(10,7) | NOT NULL | Latitud geografica. |
| longitude | DECIMAL(10,7) | NOT NULL | Longitud geografica. |
| location | VARCHAR(45) | NOT NULL | Localizacion del punto de venta. |
| energy_cost | DECIMAL(10,4) | NOT NULL | Costo de la energia por kWh. |
| currency_type | ENUM('COP','USD','EUR','MXN') | NOT NULL | Tipo de moneda. |
| collection_fee | DECIMAL(5,2) | NOT NULL | Porcentaje de comision. |
| co2_emission_factor | DECIMAL(10,6) | NOT NULL | Factor de emision de CO2 (kgCO2/kWh). |
| created_at | TIMESTAMP | NULL | Fecha y hora de creacion. |
| update_at | TIMESTAMP | NULL | Fecha y hora de actualizacion. |

### device

Tabla que almacena la informacion de los dispositivos IoT instalados en cada punto de venta.

| Columna | Tipo | Restricciones | Descripcion |
|---------|------|---------------|-------------|
| id_device | BIGINT | PK, UNIQUE, NOT NULL, AUTO_INCREMENT | Identificador unico del dispositivo. |
| id_point_of_sale | INT | FK, NOT NULL | Referencia a Point_of_Sale.id_point_of_sale. |
| device_code | VARCHAR(20) | UNIQUE, NOT NULL | Codigo unico del dispositivo. |
| name | VARCHAR(255) | NOT NULL | Nombre o etiqueta del dispositivo. |
| type_device | ENUM('Fridge','Chiller') | NOT NULL | Tipo de dispositivo. |
| type_product | ENUM('non_perishable','perishable','---') | NOT NULL | Tipo de producto que almacena. |
| min_temperature | DECIMAL(5,2) | NULL | Temperatura minima permitida (C). |
| max_temperature | DECIMAL(5,2) | NULL | Temperatura maxima permitida (C). |
| shutdown_limit | DECIMAL(5,2) | NOT NULL | Coeficiente de referencia para apagado. |
| status | ENUM('Online','Offline') | NOT NULL | Estado de conectividad. |
| base_line | DECIMAL(12,4) | NULL | Linea base de consumo energetico (kWh). |
| baseline_calculation_start | DATE | NULL | Fecha inicio del calculo de linea base. |
| baseline_calculation_end | DATE | NULL | Fecha fin del calculo de linea base. |
| energy_capability | BOOLEAN | NOT NULL | Reporta consumo energetico. |
| temperature_capability | BOOLEAN | NOT NULL | Reporta temperatura. |
| operational_status | ENUM('Normal','Defrost','Maintenance','Off') | NOT NULL | Modo operativo actual. |
| created_at | TIMESTAMP | NULL | Fecha y hora de creacion. |
| update_at | TIMESTAMP | NULL | Fecha y hora de actualizacion. |

### customer_contact

Tabla que almacena los contactos asociados a un cliente.

| Columna | Tipo | Restricciones | Descripcion |
|---------|------|---------------|-------------|
| id_contact | BIGINT | PK, NOT NULL, AUTO_INCREMENT | Identificador unico del contacto. |
| id_client | INT | FK, NOT NULL | Referencia a Clients.id_client. |
| position | VARCHAR(100) | NULL | Cargo o rol del contacto. |
| name | VARCHAR(255) | NOT NULL | Nombre completo del contacto. |
| phone | VARCHAR(30) | NULL | Numero telefonico. |
| email | VARCHAR(255) | NOT NULL | Correo electronico. |
| receive_notifications | BOOLEAN | NOT NULL DEFAULT true | Recibe notificaciones del sistema. |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Fecha y hora de creacion. |
| update_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Fecha y hora de actualizacion. |

### period_pos

Tabla que define los periodos de corte reales asociados a un punto de venta.

| Columna | Tipo | Restricciones | Descripcion |
|---------|------|---------------|-------------|
| id_period | BIGINT | PK, NOT NULL, AUTO_INCREMENT | Identificador unico del periodo. |
| id_point_of_sale | INT | FK, NOT NULL | Referencia a Point_of_Sale.id_point_of_sale. |
| period_start | DATE | NOT NULL | Fecha de inicio del periodo de corte. |
| period_end | DATE | NOT NULL | Fecha de fin del periodo de corte. |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Fecha y hora de creacion. |
| update_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Fecha y hora de actualizacion. |

### period_device

Tabla que define los periodos de corte asociados a un dispositivo.

| Columna | Tipo | Restricciones | Descripcion |
|---------|------|---------------|-------------|
| id_period | BIGINT | PK, NOT NULL, AUTO_INCREMENT | Identificador unico del periodo. |
| id_device | BIGINT | FK, NOT NULL | Referencia a Device.id_device. |
| period_start | DATE | NOT NULL | Fecha de inicio del periodo de corte. |
| period_end | DATE | NOT NULL | Fecha de fin del periodo de corte. |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Fecha y hora de creacion. |
| update_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Fecha y hora de actualizacion. |

### administrative_report

Tabla que almacena los reportes administrativos mensuales por punto de venta.

| Columna | Tipo | Restricciones | Descripcion |
|---------|------|---------------|-------------|
| id_report | BIGINT | PK, NOT NULL, AUTO_INCREMENT | Identificador unico del reporte. |
| id_period | BIGINT | FK, NOT NULL | Referencia a period.id_period. |
| base_line_period | DECIMAL(12,4) | NOT NULL | Linea base del periodo (kWh). |
| collection_fee | DECIMAL(5,2) | NOT NULL | Porcentaje de comision. |
| energy_tariff | DECIMAL(10,4) | NOT NULL | Tarifa de energia (moneda/kWh). |
| total_to_pay | DECIMAL(14,2) | NOT NULL | Valor total a pagar. |
| currency_type | ENUM('COP','USD','EUR') | NOT NULL | Moneda. |
| is_cancelled | BOOLEAN | NOT NULL DEFAULT false | Reporte cancelado/anulado. |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Fecha y hora de creacion. |
| update_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Fecha y hora de actualizacion. |

### history_day_client

Tabla de historial diario con valores agregados por cliente.

| Columna | Tipo | Restricciones | Descripcion |
|---------|------|---------------|-------------|
| id_history | INT | PK, NOT NULL | Identificador unico. |
| id_client | INT | FK, NOT NULL | Cliente. |
| year | SMALLINT | NOT NULL | Ano (ej. 2026). |
| month | TINYINT | NOT NULL | Mes (1-12). |
| day | TINYINT | NOT NULL | Dia (1-31). |
| date | DATE | NOT NULL | Fecha. |
| energy_consumption | DECIMAL(14,4) | NOT NULL | Consumo energetico total del dia (kWh). |
| energy_saving | DECIMAL(14,4) | NOT NULL | Ahorro energetico del dia (kWh). |
| co2_avoided | DECIMAL(14,6) | NOT NULL | CO2 evitado (kg CO2). |
| cost_saving | DECIMAL(14,2) | NOT NULL | Ahorro economico del dia. |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Fecha y hora de creacion. |
| update_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Fecha y hora de actualizacion. |

### history_day_pos

Tabla de historial diario con valores agregados por punto de venta.

| Columna | Tipo | Restricciones | Descripcion |
|---------|------|---------------|-------------|
| id_history | INT | PK, NOT NULL | Identificador unico. |
| id_point_of_sale | INT | FK, NOT NULL | Punto de venta. |
| year | SMALLINT | NOT NULL | Ano (ej. 2026). |
| month | TINYINT | NOT NULL | Mes (1-12). |
| day | TINYINT | NOT NULL | Dia (1-31). |
| date | DATE | NOT NULL | Fecha. |
| energy_consumption | DECIMAL(14,4) | NOT NULL | Consumo energetico total del dia (kWh). |
| energy_saving | DECIMAL(14,4) | NOT NULL | Ahorro energetico del dia (kWh). |
| co2_avoided | DECIMAL(14,6) | NOT NULL | CO2 evitado (kg CO2). |
| cost_saving | DECIMAL(14,2) | NOT NULL | Ahorro economico del dia. |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Fecha y hora de creacion. |
| update_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Fecha y hora de actualizacion. |

### history_day_device

Tabla de historial diario con valores agregados por dispositivo.

| Columna | Tipo | Restricciones | Descripcion |
|---------|------|---------------|-------------|
| id_history | INT | PK, NOT NULL | Identificador unico. |
| id_device | BIGINT | FK, NOT NULL | Dispositivo. |
| year | SMALLINT | NOT NULL | Ano (ej. 2026). |
| month | TINYINT | NOT NULL | Mes (1-12). |
| day | TINYINT | NOT NULL | Dia (1-31). |
| date | DATE | NOT NULL | Fecha. |
| temperature | DECIMAL(14,4) | NOT NULL | Temperatura promedio del dia (C). |
| instant_power | DECIMAL(10,4) | NOT NULL | Potencia instantanea promedio (kW). |
| energy_consumption | DECIMAL(14,4) | NOT NULL | Consumo energetico total del dia (kWh). |
| energy_saving | DECIMAL(14,4) | NOT NULL | Ahorro energetico del dia (kWh). |
| co2_avoided | DECIMAL(14,6) | NOT NULL | CO2 evitado (kg CO2). |
| cost_saving | DECIMAL(14,2) | NOT NULL | Ahorro economico del dia. |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Fecha y hora de creacion. |
| update_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Fecha y hora de actualizacion. |

### history_period_pos

Tabla de historico por periodo para cada punto de venta.

| Columna | Tipo | Restricciones | Descripcion |
|---------|------|---------------|-------------|
| id_history | INT | PK, NOT NULL | Identificador unico. |
| id_point_of_sale | INT | FK, NOT NULL | Punto de venta. |
| id_period | BIGINT | FK, NOT NULL | Periodo de corte. |
| energy_consumption | DECIMAL(14,4) | NOT NULL | Consumo energetico total del periodo (kWh). |
| energy_saving | DECIMAL(14,4) | NOT NULL | Ahorro energetico del periodo (kWh). |
| co2_avoided | DECIMAL(14,6) | NOT NULL | CO2 evitado (kg CO2). |
| cost_saving | DECIMAL(14,2) | NOT NULL | Ahorro economico del periodo. |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Fecha y hora de creacion. |
| update_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Fecha y hora de actualizacion. |

### history_period_device

Tabla de historico por periodo para cada dispositivo.

| Columna | Tipo | Restricciones | Descripcion |
|---------|------|---------------|-------------|
| id_history | INT | PK, NOT NULL | Identificador unico. |
| id_device | BIGINT | FK, NOT NULL | Dispositivo. |
| id_period | BIGINT | FK, NOT NULL | Periodo de corte. |
| temperature | DECIMAL(14,4) | NOT NULL | Temperatura promedio del periodo (C). |
| instant_power | DECIMAL(10,4) | NOT NULL | Potencia instantanea promedio (kW). |
| energy_consumption | DECIMAL(14,4) | NOT NULL | Consumo energetico total del periodo (kWh). |
| energy_saving | DECIMAL(14,4) | NOT NULL | Ahorro energetico del periodo (kWh). |
| co2_avoided | DECIMAL(14,6) | NOT NULL | CO2 evitado (kg CO2). |
| cost_saving | DECIMAL(14,2) | NOT NULL | Ahorro economico del periodo. |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Fecha y hora de creacion. |
| update_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Fecha y hora de actualizacion. |

### history_hour_variable

Tabla de historico horario de variables operativas por dispositivo.

| Columna | Tipo | Restricciones | Descripcion |
|---------|------|---------------|-------------|
| id_history | INT | PK, NOT NULL | Identificador unico. |
| id_device | BIGINT | FK, NOT NULL | Dispositivo. |
| year | SMALLINT | NOT NULL | Ano (ej. 2026). |
| month | TINYINT | NOT NULL | Mes (1-12). |
| day | TINYINT | NOT NULL | Dia (1-31). |
| hour | TINYINT | NOT NULL | Hora (0-23). |
| minute | TINYINT | NOT NULL | Minuto (1-60). |
| datetime | DATETIME | NOT NULL | Fecha y hora. |
| temperature | DECIMAL(5,2) | NOT NULL | Temperatura promedio (C). |
| instant_power | DECIMAL(10,4) | NOT NULL | Potencia instantanea promedio (kW). |
| energy_consumption | DECIMAL(14,4) | NOT NULL | Consumo energetico (kWh). |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Fecha y hora de creacion. |
| update_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Fecha y hora de actualizacion. |

### non_shutdown_schedule

Tabla que define los intervalos de tiempo en los que un dispositivo NO debe apagarse.

| Columna | Tipo | Restricciones | Descripcion |
|---------|------|---------------|-------------|
| id_hschedule | BIGINT | PK, NOT NULL | Identificador unico. |
| id_device | BIGINT | FK, NOT NULL | Dispositivo. |
| label | VARCHAR(100) | NOT NULL | Etiqueta del horario. |
| start_date | DATE | NULL | Fecha de inicio. |
| end_date | DATE | NULL | Fecha de fin. |
| start_time | TIME | NOT NULL | Hora de inicio. |
| end_time | TIME | NOT NULL | Hora de fin. |
| days_of_week | VARCHAR(20) | NULL | Dias de no-apagado. |
| status_schedule | ENUM('Activo','Cancelado') | NOT NULL | Estado del horario. |
| device_confirmation | BOOLEAN | NOT NULL DEFAULT false | Confirmacion del dispositivo. |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Fecha y hora de creacion. |
| update_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Fecha y hora de actualizacion. |

### alarms

Tabla que registra las alarmas generadas por los dispositivos.

| Columna | Tipo | Restricciones | Descripcion |
|---------|------|---------------|-------------|
| id_alarm | BIGINT | PK, UNIQUE, NOT NULL, AUTO_INCREMENT | Identificador unico. |
| id_device | BIGINT | FK, NOT NULL | Referencia a Device.id_device. |
| type | VARCHAR(100) | NOT NULL | Tipo de alarma. |
| status | ENUM('Active','Inactive') | NOT NULL | Estado de la alarma. |
| value | DECIMAL(10,4) | NULL | Valor asociado. |
| alarm_timestamp | DATETIME | NOT NULL | Fecha y hora de la alarma. |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Fecha y hora de creacion. |
| update_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Fecha y hora de actualizacion. |

### data_base_line

Tabla que almacena los datos historicos de consumo energetico para el calculo de la linea base.

| Columna | Tipo | Restricciones | Descripcion |
|---------|------|---------------|-------------|
| id_data | BIGINT | PK, NOT NULL | Identificador unico. |
| id_device | BIGINT | FK, NOT NULL | Dispositivo. |
| instant_power | DECIMAL(10,4) | NOT NULL | Potencia instantanea (kW). |
| energy_consumption | DECIMAL(14,4) | NOT NULL | Consumo energetico (kWh). |
| data_timestamp | DATETIME | NOT NULL | Fecha y hora del registro. |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Fecha y hora de creacion. |
| update_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Fecha y hora de actualizacion. |
