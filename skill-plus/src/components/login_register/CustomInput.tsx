import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet, TouchableWithoutFeedback } from 'react-native';

interface CustomInputProps extends TextInputProps {
  label: string;
}

export default function CustomInput({ label, style, ...props }: CustomInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  return (
    <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          ref={inputRef}
          placeholderTextColor="#666666"
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          style={[
            styles.input,
            isFocused && styles.focusedInput,
            style,
          ]}
          {...props}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#D0D0D0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#121212',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    fontSize: 16,
  },
  focusedInput: {
    borderColor: '#FF6F00',
  },
});