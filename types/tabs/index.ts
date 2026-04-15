import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

export type categoryTypes = string[]

export type NamedStyles = Record<string, ViewStyle | TextStyle | ImageStyle>;

export type ImagePost = {
  id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
};