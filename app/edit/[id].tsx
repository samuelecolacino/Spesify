import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Modal,
    Pressable,
    FlatList
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useExpenseStore } from '@/src/store/expenseStore';

export default function EditScreen() {
    const { id } = useLocalSearchParams<{ id: string; }>();
    const router = useRouter();

    const expenses = useExpenseStore((state) => state.expenses);
    const categories = useExpenseStore((state) => state.categories);
    const updateExpense = useExpenseStore((state) => state.updateExpense);
    const pendingImage = useExpenseStore((state) => state.pendingImage);
    const setPendingImage = useExpenseStore((state) => state.setPendingImage);

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [imageURI, setImageURI] = useState<string | null>(null);

    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    useEffect(() => {
        const expense = expenses.find((e) => e.id === id);
        if (expense) {
            setName(expense.name);
            setPrice(expense.price);
            setCategory(expense.category);
            setDescription(expense.description || '');
            setImageURI(expense.imageURI || null);
        } else {
            router.replace('/');
        }
    }, [id]);

    useEffect(() => {
        if (pendingImage) {
            setImageURI(pendingImage);
            setIsEditing(true);
            setPendingImage(null); // Clear it immediately
        }
    }, [pendingImage]);

    const openCamera = () => {
        router.push({
            pathname: '/camera',
            params: { returnTo: `edit/${id}` }
        });
    };

    const handleSave = async () => {
        if (!name.trim() || !price.trim() || !category) {
            Alert.alert("Missing Information", "Please provide a name, price, and category.");
            return;
        }

        const expense = expenses.find((e) => e.id === id);
        if (expense) {
            try {
                await updateExpense({
                    ...expense,
                    name,
                    price,
                    category,
                    description,
                    imageURI: imageURI || undefined,
                });
                setIsEditing(false);
                router.back();
            } catch (error) {
                Alert.alert("Error", "Failed to update expense in database.");
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                            <Ionicons name="chevron-back" size={32} color="#ffffff" />
                        </TouchableOpacity>

                        <Text style={styles.headerTitle}>Details</Text>

                        <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.iconButton}>
                            <Text style={styles.editButtonText}>
                                {isEditing ? 'Cancel' : 'Edit'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Image Section */}
                    <TouchableOpacity
                        style={styles.imageContainer}
                        onPress={openCamera}
                        disabled={!isEditing}
                        activeOpacity={0.7}
                    >
                        {imageURI ? (
                            <Image source={{ uri: imageURI }} style={styles.image} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Ionicons name="camera-outline" size={60} color="#333" />
                                <Text style={styles.placeholderText}>Tap to take photo</Text>
                            </View>
                        )}

                        {isEditing && (
                            <View style={styles.cameraOverlay}>
                                <Ionicons name="camera" size={24} color="#fff" />
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Form Fields */}
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>NAME</Text>
                            <TextInput
                                style={[styles.input, !isEditing && styles.inputDisabled]}
                                value={name}
                                onChangeText={setName}
                                editable={isEditing}
                                placeholder="Expense Name"
                                placeholderTextColor="#444"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>PRICE ($)</Text>
                            <TextInput
                                style={[styles.input, !isEditing && styles.inputDisabled]}
                                value={price}
                                onChangeText={setPrice}
                                editable={isEditing}
                                keyboardType="decimal-pad"
                                placeholder="0.00"
                                placeholderTextColor="#444"
                            />
                        </View>

                        {/* Updated Category Dropdown */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>CATEGORY</Text>
                            <TouchableOpacity
                                style={[styles.pickerTrigger, !isEditing && styles.pickerTriggerDisabled]}
                                onPress={() => isEditing && setShowCategoryPicker(true)}
                                activeOpacity={0.7}
                                disabled={!isEditing}
                            >
                                <Text style={[
                                    styles.pickerText,
                                    !category && styles.pickerPlaceholder,
                                    !isEditing && styles.textDisabled
                                ]}>
                                    {category || 'Select Category'}
                                </Text>
                                {isEditing && <Ionicons name="chevron-down" size={20} color="#ffffff" />}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>DESCRIPTION</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, !isEditing && styles.inputDisabled]}
                                value={description}
                                onChangeText={setDescription}
                                editable={isEditing}
                                multiline
                                numberOfLines={4}
                                placeholder="Additional details..."
                                placeholderTextColor="#444"
                            />
                        </View>

                        {isEditing && (
                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Category Bottom Sheet Modal */}
            <Modal
                visible={showCategoryPicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowCategoryPicker(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowCategoryPicker(false)}>
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Category</Text>
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
                                        <Ionicons name="checkmark" size={20} color="#4ea8de" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 20,
    },
    headerTitle: {
        fontSize: 28,
        color: '#ffffff',
        fontStyle: 'italic',
        fontWeight: 'bold',
        fontFamily: 'serif',
    },
    iconButton: {
        minWidth: 60,
    },
    editButtonText: {
        color: '#4ea8de',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    imageContainer: {
        width: '100%',
        height: 200,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#000',
        borderWidth: 1,
        borderColor: '#ffffff',
        marginBottom: 30,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#333',
        marginTop: 8,
        fontSize: 12,
        fontWeight: 'bold',
    },
    cameraOverlay: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 8,
        borderRadius: 20,
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        color: '#4ea8de',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    input: {
        borderBottomWidth: 1,
        borderColor: '#ffffff',
        color: '#ffffff',
        fontSize: 18,
        paddingVertical: 10,
    },
    inputDisabled: {
        borderColor: '#222',
        color: '#888',
    },
    textDisabled: {
        color: '#888',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    saveButton: {
        marginTop: 30,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingVertical: 18,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    },

    /* ── Category Picker Styles ── */
    pickerTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#ffffff',
        paddingVertical: 12,
    },
    pickerTriggerDisabled: {
        borderColor: '#222',
    },
    pickerText: {
        color: '#ffffff',
        fontSize: 18,
    },
    pickerPlaceholder: {
        color: '#444',
    },

    /* ── Category Modal Styles ── */
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
});