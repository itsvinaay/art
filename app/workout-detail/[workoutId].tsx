import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Settings, 
  Calendar,
  Play,
  X,
  Clock,
  Dumbbell,
  RotateCcw
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme, getColors } from '@/hooks/useColorScheme';
import { router, useLocalSearchParams } from 'expo-router';
import { getWorkoutTemplate, WorkoutTemplate } from '@/lib/workoutTemplates';

const { width, height } = Dimensions.get('window');

interface ExerciseWithDetails {
  id: string;
  name: string;
  sets: number;
  reps: string;
  image: string;
}

export default function WorkoutDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);
  const styles = createStyles(colors);
  const { workoutId } = useLocalSearchParams();

  const [workout, setWorkout] = useState<WorkoutTemplate | null>(null);
  const [exercises, setExercises] = useState<ExerciseWithDetails[]>([]);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkoutDetails();
  }, []);

  const loadWorkoutDetails = async () => {
    try {
      setLoading(true);
      const workoutTemplate = await getWorkoutTemplate(workoutId as string);
      
      if (workoutTemplate) {
        setWorkout(workoutTemplate);
        
        // Transform exercises with additional details
        const exercisesWithDetails: ExerciseWithDetails[] = workoutTemplate.exercises.map((exercise, index) => ({
          id: exercise.id || `exercise-${index}`,
          name: exercise.name,
          sets: exercise.sets?.length || 0,
          reps: exercise.sets?.map(set => set.reps).join(', ') || '',
          image: getExerciseImage(exercise.name, index),
        }));
        
        setExercises(exercisesWithDetails);
      } else {
        Alert.alert('Error', 'Workout template not found', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Error loading workout details:', error);
      Alert.alert('Error', 'Failed to load workout details', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getExerciseImage = (exerciseName: string, index: number): string => {
    // Use different Pexels images for different exercises
    const images = [
      'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/3822356/pexels-photo-3822356.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1229356/pexels-photo-1229356.jpeg?auto=compress&cs=tinysrgb&w=400',
    ];
    return images[index % images.length];
  };

  const handleStartWorkout = () => {
    if (workout) {
      router.push(`/start-workout/${workout.id}`);
    }
  };

  const handleReschedule = () => {
    setShowRescheduleModal(true);
  };

  const handleMoveToToday = () => {
    setShowRescheduleModal(false);
    Alert.alert('Success', 'Workout moved to today!');
  };

  const renderExerciseItem = (exercise: ExerciseWithDetails, index: number) => (
    <TouchableOpacity key={exercise.id} style={styles.exerciseItem}>
      <View style={styles.exerciseImageContainer}>
        <Image source={{ uri: exercise.image }} style={styles.exerciseImage} />
        <View style={styles.exercisePlayButton}>
          <Play size={16} color="#FFFFFF" />
        </View>
      </View>
      
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.exerciseDetails}>
          {exercise.reps ? `${exercise.reps} reps` : 'Custom reps'} • {exercise.sets} sets
        </Text>
      </View>
      
      <View style={styles.exerciseSets}>
        <Text style={styles.exerciseSetCount}>x{exercise.sets}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEquipmentItem = (equipment: string, index: number) => (
    <View key={index} style={styles.equipmentItem}>
      <Text style={styles.equipmentIcon}>
        {equipment === 'Barbell' ? '🏋️' : equipment === 'Dumbbell' ? '🏋️‍♀️' : '🔗'}
      </Text>
      <Text style={styles.equipmentName}>{equipment}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Workout not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const equipment = ['Barbell', 'Cable Machine', 'Dumbbell'];

  return (
    <View style={styles.container}>
      {/* Hero Section with Background Image */}
      <View style={styles.heroSection}>
        <Image 
          source={{ uri: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800' }}
          style={styles.heroImage}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          style={styles.heroOverlay}
        >
          <SafeAreaView style={styles.heroContent}>
            {/* Header */}
            <View style={styles.heroHeader}>
              <TouchableOpacity onPress={() => router.back()} style={styles.heroBackButton}>
                <ArrowLeft size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.heroActions}>
                <TouchableOpacity style={styles.heroActionButton}>
                  <RotateCcw size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.heroActionButton}>
                  <Settings size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Workout Info */}
            <View style={styles.heroInfo}>
              <Text style={styles.heroDate}>TODAY'S WORKOUT</Text>
              <Text style={styles.heroTitle}>{workout.name}</Text>
              <Text style={styles.heroDescription}>{workout.description}</Text>
              <TouchableOpacity style={styles.startWorkoutButton} onPress={handleStartWorkout}>
                <Text style={styles.startWorkoutText}>Start Workout</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Workout Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Details</Text>
          <View style={styles.workoutInfoGrid}>
            <View style={styles.workoutInfoItem}>
              <Clock size={20} color={colors.primary} />
              <Text style={styles.workoutInfoLabel}>Duration</Text>
              <Text style={styles.workoutInfoValue}>{workout.duration} min</Text>
            </View>
            <View style={styles.workoutInfoItem}>
              <Dumbbell size={20} color={colors.success} />
              <Text style={styles.workoutInfoLabel}>Exercises</Text>
              <Text style={styles.workoutInfoValue}>{exercises.length}</Text>
            </View>
            <View style={styles.workoutInfoItem}>
              <Target size={20} color={colors.warning} />
              <Text style={styles.workoutInfoLabel}>Category</Text>
              <Text style={styles.workoutInfoValue}>{workout.category}</Text>
            </View>
          </View>
        </View>

        {/* Equipment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment</Text>
          <View style={styles.equipmentList}>
            {equipment.map(renderEquipmentItem)}
          </View>
        </View>

        {/* Warm Up Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dynamic Warm Up</Text>
          <TouchableOpacity style={styles.warmUpItem}>
            <View style={styles.warmUpImageContainer}>
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/3822356/pexels-photo-3822356.jpeg?auto=compress&cs=tinysrgb&w=400' }}
                style={styles.warmUpImage}
              />
              <View style={styles.warmUpPlayButton}>
                <Play size={16} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.warmUpInfo}>
              <Text style={styles.warmUpName}>Dynamic Warm Up Routine</Text>
              <Text style={styles.warmUpDuration}>5-10 minutes</Text>
            </View>
            <Text style={styles.warmUpCount}>x1</Text>
          </TouchableOpacity>
        </View>

        {/* Main Exercises Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Main Exercises</Text>
          {exercises.map(renderExerciseItem)}
        </View>

        {/* Cool Down Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cool Down & Stretching</Text>
          <TouchableOpacity style={styles.coolDownItem}>
            <View style={styles.coolDownImageContainer}>
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/3822356/pexels-photo-3822356.jpeg?auto=compress&cs=tinysrgb&w=400' }}
                style={styles.coolDownImage}
              />
              <View style={styles.coolDownPlayButton}>
                <Play size={16} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.coolDownInfo}>
              <Text style={styles.coolDownName}>Post-Workout Stretches</Text>
              <Text style={styles.coolDownDuration}>5-10 minutes</Text>
            </View>
            <Text style={styles.coolDownCount}>x1</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Reschedule Modal */}
      <Modal
        visible={showRescheduleModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowRescheduleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Calendar size={32} color={colors.primary} />
            </View>
            
            <Text style={styles.modalTitle}>Workout reschedule</Text>
            <Text style={styles.modalMessage}>
              Do you want to move this workout to today?
            </Text>
            
            <TouchableOpacity style={styles.modalButton} onPress={handleMoveToToday}>
              <Text style={styles.modalButtonText}>Move to today</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setShowRescheduleModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowRescheduleModal(false)}
            >
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  heroSection: {
    height: height * 0.5,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  heroBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 12,
  },
  heroActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroInfo: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroDate: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 38,
  },
  heroDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
    lineHeight: 22,
  },
  startWorkoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignSelf: 'flex-start',
  },
  startWorkoutText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: colors.text,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: colors.text,
    marginBottom: 16,
  },
  workoutInfoGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  workoutInfoItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  workoutInfoLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  workoutInfoValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: colors.text,
  },
  equipmentList: {
    flexDirection: 'row',
    gap: 16,
  },
  equipmentItem: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    minWidth: 80,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  equipmentIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  equipmentName: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
  warmUpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  warmUpImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  warmUpImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  warmUpPlayButton: {
    position: 'absolute',
    top: 22,
    left: 22,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  warmUpInfo: {
    flex: 1,
  },
  warmUpName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  warmUpDuration: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  warmUpCount: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: colors.text,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  exerciseImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  exercisePlayButton: {
    position: 'absolute',
    top: 22,
    left: 22,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  exerciseDetails: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  exerciseSets: {
    alignItems: 'center',
  },
  exerciseSetCount: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: colors.text,
  },
  coolDownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  coolDownImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  coolDownImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  coolDownPlayButton: {
    position: 'absolute',
    top: 22,
    left: 22,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coolDownInfo: {
    flex: 1,
  },
  coolDownName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  coolDownDuration: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  coolDownCount: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    position: 'relative',
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  modalButton: {
    backgroundColor: colors.textSecondary,
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    marginBottom: 16,
  },
  modalButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modalCancelText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});