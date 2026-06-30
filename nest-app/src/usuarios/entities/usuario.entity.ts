import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UsuarioDocument = Usuario & Document;

@Schema({ timestamps: true })
export class Usuario {
  @Prop({ required: true, trim: true })
  nombre!: string;

  @Prop({ required: true, trim: true })
  apellido!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  correo!: string;

  @Prop({ required: true, unique: true, trim: true })
  nombreUsuario!: string;

  @Prop({ required: true })
  contrasena!: string;

  @Prop({ required: true })
  fechaNacimiento!: Date;

  @Prop({ default: '' })
  descripcion?: string;

  @Prop({ default: '' })
  imagenPerfil?: string;

  @Prop({ default: 'usuario', enum: ['usuario', 'administrador'] })
  perfil!: string;

  @Prop({ default: true })
  activo!: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
