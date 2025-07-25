#!/bin/bash

# --- Configuración ---
BASE_DIR="src"
CORE_DIR="$BASE_DIR/core"
DOMAIN_DIR="$CORE_DIR/domain"
PORTS_DIR="$CORE_DIR/ports"
PORTS_IN_DIR="$PORTS_DIR/in"
PORTS_OUT_DIR="$PORTS_DIR/out"
SERVICES_DIR="$CORE_DIR/services"
INFRA_DIR="$BASE_DIR/infrastructure"
PERSISTENCE_DIR="$INFRA_DIR/persistence"
IN_MEMORY_PERSISTENCE_DIR="$PERSISTENCE_DIR/in-memory"
API_DIR="$INFRA_DIR/api"
CONTROLLERS_DIR="$API_DIR/controllers"
DTOS_DIR="$API_DIR/dtos"
COMMON_DIR="$INFRA_DIR/common"

# --- Funciones para crear archivos con contenido ---

create_interface() {
  local path=$1
  local name=$2
  echo "export interface $name {}" > "$path/${name}.ts"
  echo "Created $path/${name}.ts (interface)"
}

create_class() {
  local path=$1
  local name=$2
  echo "export class $name {}" > "$path/${name}.ts"
  echo "Created $path/${name}.ts (class)"
}

create_enum() {
  local path=$1
  local name=$2
  echo "export enum $name {}" > "$path/${name}.ts"
  echo "Created $path/${name}.ts (enum)"
}

create_empty_file() {
  local path=$1
  local name=$2
  touch "$path/$name"
  echo "Created $path/$name (empty)"
}

# --- Creación de Carpetas ---
echo "Creating core directories..."
mkdir -p "$DOMAIN_DIR"
mkdir -p "$PORTS_IN_DIR"
mkdir -p "$PORTS_OUT_DIR"
mkdir -p "$SERVICES_DIR"

echo "Creating infrastructure directories..."
mkdir -p "$IN_MEMORY_PERSISTENCE_DIR"
mkdir -p "$CONTROLLERS_DIR"
mkdir -p "$DTOS_DIR"
mkdir -p "$COMMON_DIR"


# --- Creación de Archivos del Dominio (Core) ---
echo "Creating domain files..."
create_interface "$DOMAIN_DIR" "empresa.entity"
create_interface "$DOMAIN_DIR" "transferencia.entity"
create_enum "$DOMAIN_DIR" "empresa-tipo.enum"


# --- Creación de Archivos de Puertos ---
echo "Creating port files (inbound/driven)..."
create_interface "$PORTS_IN_DIR" "empresa-service.port"
create_interface "$PORTS_IN_DIR" "transferencia-service.port" # Aunque no lo usamos directo en los requisitos, es un buen placeholder


echo "Creating port files (outbound/driving)..."
create_interface "$PORTS_OUT_DIR" "empresa-repository.port"
create_interface "$PORTS_OUT_DIR" "transferencia-repository.port"


# --- Creación de Archivos de Servicios (Capa de Aplicación) ---
echo "Creating service files..."
create_class "$SERVICES_DIR" "empresa.service"
create_class "$SERVICES_DIR" "transferencia.service" # Placeholder


# --- Creación de Archivos de Infraestructura (Adaptadores) ---
echo "Creating in-memory persistence files..."
create_class "$IN_MEMORY_PERSISTENCE_DIR" "in-memory-empresa.repository"
create_class "$IN_MEMORY_PERSISTENCE_DIR" "in-memory-transferencia.repository"
create_empty_file "$IN_MEMORY_PERSISTENCE_DIR" "data.ts" # Para los datos mockeados

echo "Creating API controller files..."
create_class "$CONTROLLERS_DIR" "empresa.controller"

echo "Creating DTO files..."
create_class "$DTOS_DIR" "create-empresa.dto"
create_class "$DTOS_DIR" "empresa-response.dto" # DTO de salida, buena práctica


echo "Creating common files..."
create_empty_file "$COMMON_DIR" "date.utils.ts" # Para funciones de fechas, si las necesitas


echo "Structure generation complete!"
echo "Remember to update your app.module.ts to include the new modules, controllers, and providers."