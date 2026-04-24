import React, { useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  SectionList,
} from 'react-native';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";

// 1. Import from your new store and service
import { useExpenseStore } from '@/src/store/expenseStore';
import { Expense } from '@/src/services/db';

interface ExpenseItemProps {
  item: Expense;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const ExpenseItem = ({ item, onDelete, onEdit }: ExpenseItemProps) => {
  const swipeableRef = useRef<Swipeable>(null);

  const renderLeftActions = () => (
      <View style={styles.rightAction}>
        <Ionicons name="trash-outline" size={24} color="#ffffff" />
      </View>
  );

  const renderRightActions = () => (
      <View style={styles.leftAction}>
        <Text style={styles.actionText}>Edit</Text>
      </View>
  );

  const handleSwipeableOpen = (direction: 'left' | 'right') => {
    swipeableRef.current?.close();
    if (direction === 'left') {
      onDelete(item.id);
    } else {
      onEdit(item.id);
    }
  };

  return (
      <Swipeable
          ref={swipeableRef}
          renderLeftActions={renderLeftActions}
          renderRightActions={renderRightActions}
          onSwipeableOpen={handleSwipeableOpen}
      >
        <View style={styles.itemContainer}>
          {item.imageURI ? (
              <Image source={{ uri: item.imageURI }} style={styles.itemImage} />
          ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="receipt-outline" size={24} color="#666" />
              </View>
          )}

          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDescription} numberOfLines={1}>
              {item.description}
            </Text>
          </View>

          <View style={styles.itemEnd}>
            <Text style={styles.itemPrice}>{item.price} $</Text>
            <TouchableOpacity onPress={() => onDelete(item.id)}>
              <Ionicons name="trash-outline" size={20} color="#ff3333" />
            </TouchableOpacity>
          </View>
        </View>
      </Swipeable>
  );
};

export default function OverviewScreen() {
  const router = useRouter();

  // 2. Connect to the Store
  const { expenses, initialize, deleteExpense, isInitialized } = useExpenseStore();

  // 3. Load data from DB on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, []);

  const handleDelete = (id: string) => {
    deleteExpense(id);
  };

  const handleEdit = (id: string) => {
    router.push(`/edit/${id}`);
  };

  // 4. Grouping still works the same, but uses store data
  const groupedExpenses = useMemo(() => {
    const map = new Map<string, Expense[]>();
    expenses.forEach((e) => {
      if (!map.has(e.category)) map.set(e.category, []);
      map.get(e.category)!.push(e);
    });
    return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
  }, [expenses]);

  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Spesify</Text>
            <Text style={styles.subtitle}>Deine Ausgaben im Überblick</Text>
          </View>

          <View style={styles.addButtonContainer}>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/create')}
            >
              <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>
          </View>

          <SectionList
              sections={groupedExpenses}
              keyExtractor={(item) => item.id}
              stickySectionHeadersEnabled={false}
              renderItem={({ item }) => (
                  <ExpenseItem
                      item={item}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                  />
              )}
              renderSectionHeader={({ section: { title } }) => (
                  <Text style={styles.sectionHeader}>{title}</Text>
              )}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.subtitle}>Noch keine Ausgaben erfasst.</Text>
                </View>
              }
          />
        </SafeAreaView>
      </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    color: '#ffffff',
    fontStyle: 'italic',
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  subtitle: {
    color: '#aaaaaa',
    fontSize: 16,
    marginTop: 10,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    color: '#4ea8de',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
    paddingLeft: 5,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#ffffff',
    borderRadius: 16,
    padding: 10,
    marginBottom: 15,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  imagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  itemDescription: {
    color: '#888888',
    fontSize: 12,
    marginTop: 4,
  },
  itemEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  itemPrice: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  leftAction: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 15,
    borderRadius: 16,
    paddingHorizontal: 20,
    marginLeft: 10,
    flex: 1,
  },
  rightAction: {
    backgroundColor: '#ff3333',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 15,
    borderRadius: 16,
    paddingHorizontal: 20,
    marginRight: 10,
    flex: 1,
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addButtonContainer: {
    paddingHorizontal: 20,
    alignItems: 'flex-end',
    marginBottom: 5,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
});
