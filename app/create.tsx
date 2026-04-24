import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import 'react-native-get-random-values';
import { SafeAreaView } from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';
import { useExpenseStore } from '@/src/store/expenseStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = SCREEN_WIDTH * 0.38;

export default function CreateScreen() {

  const { categories, addExpense, initialize, isInitialized, pendingImage, setPendingImage } = useExpenseStore();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Ensure the store is initialized (DB + categories loaded)
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized]);

  // When we come back from the camera with a photo, update the preview
  useEffect(() => {
    if (pendingImage) {
      setImageUri(pendingImage); // Update local form state
      setPendingImage(null);     // Clear the global store
    }
  }, [pendingImage]);

  function openCamera() {
    router.push('/camera');
  }

  async function handleCreate() {
    if (!name.trim() || !price.trim() || !category) {
      Alert.alert('Fehlende Angaben', 'Bitte Name, Preis und Kategorie ausfüllen.');
      return;
    }

    await addExpense({
      id: uuidv4(),
      name: name.trim(),
      description: description.trim(),
      price: price.trim(),
      category,
      date: new Date().toISOString(),
      imageURI: imageUri ?? undefined,
    });

    router.replace('/');
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.replace('/')}
              style={{ marginLeft: 0, padding: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Top row: Image + Name/Price ── */}
          <View style={styles.topRow}>
            {/* Image preview / camera trigger */}
            <TouchableOpacity
              style={styles.imageBox}
              onPress={openCamera}
              activeOpacity={0.7}
            >
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.previewImage}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera-outline" size={36} color="rgba(255,255,255,0.4)" />
                  <Text style={styles.imagePlaceholderText}>Foto</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Name & Price inputs */}
            <View style={styles.inputColumn}>
              <TextInput
                style={styles.textInput}
                placeholder="Name"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={name}
                onChangeText={setName}
                returnKeyType="next"
                testID="input-name"
              />
              <TextInput
                style={styles.textInput}
                placeholder="Price"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                returnKeyType="done"
                testID="input-price"
              />
            </View>
          </View>

          {/* ── Category Picker ── */}
          <TouchableOpacity
            style={styles.pickerTrigger}
            onPress={() => setShowCategoryPicker(true)}
            activeOpacity={0.7}
            testID="category-trigger"
          >
            <Text style={category ? styles.pickerText : styles.pickerPlaceholder}>
              {category || 'Kategorie wählen'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>

          {/* Category bottom sheet modal */}
          <Modal
            visible={showCategoryPicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowCategoryPicker(false)}
          >
            <Pressable style={styles.modalOverlay} onPress={() => setShowCategoryPicker(false)}>
              <View style={styles.modalSheet}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>Kategorie</Text>
                <FlatList
                  data={categories}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.modalOption,
                        category === item && styles.modalOptionSelected,
                      ]}
                      onPress={() => {
                        setCategory(item);
                        setShowCategoryPicker(false);
                      }}
                      activeOpacity={0.6}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,
                          category === item && styles.modalOptionTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                      {category === item && (
                        <Ionicons name="checkmark" size={20} color="#4ADE80" />
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </Pressable>
          </Modal>

          {/* ── Description ── */}
          <Text style={styles.descriptionLabel}>Description</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Beschreibung eingeben…"
            placeholderTextColor="rgba(255,255,255,0.25)"
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />

          {/* Divider line */}
          <View style={styles.divider} />
        </ScrollView>

        {/* ── Create Button (pinned to bottom) ── */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreate}
            activeOpacity={0.8}
            testID="button-create"
          >
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    flexGrow: 1,
  },

  /* ── Top Row ── */
  topRow: {
    flexDirection: 'row',
    marginBottom: 28,
  },
  imageBox: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginRight: 18,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  imagePlaceholderText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontWeight: '500',
  },
  inputColumn: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  textInput: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
    color: '#fff',
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  /* ── Category Picker ── */
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 32,
  },
  pickerText: {
    color: '#fff',
    fontSize: 16,
  },
  pickerPlaceholder: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
  },

  /* ── Category Modal ── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 36,
    maxHeight: '50%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  modalOptionSelected: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  modalOptionText: {
    color: '#fff',
    fontSize: 16,
  },
  modalOptionTextSelected: {
    fontWeight: '600',
  },

  /* ── Description ── */
  descriptionLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  descriptionInput: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
    minHeight: 160,
    paddingHorizontal: 4,
    paddingTop: 0,
  },

  /* ── Divider ── */
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: 16,
  },

  /* ── Bottom Bar ── */
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    paddingTop: 12,
  },
  createButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});