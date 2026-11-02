import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import {
  BackButton,
  Badge,
  Card,
  ErrorState,
  EmptyState,
  Header,
  LoadingState,
  PressableCard,
  Row,
  SearchBar,
  Section,
  StatusBadge,
} from '../src/components/ui';
test('loading, error, and back components expose state and action accessibly', async () => {
  let renderer;
  const retry = jest.fn();
  const back = jest.fn();
  await act(async () => {
    renderer = Renderer.create(
      <>
        <LoadingState message="Loading records" />
        <ErrorState
          title="Load failed"
          message="Try again later"
          onRetry={retry}
        />
        <BackButton onPress={back} />
      </>,
    );
  });
  const text = JSON.stringify(renderer.toJSON());
  expect(text).toContain('Loading records');
  expect(text).toContain('Load failed');
  expect(text).toContain('Try again later');
  const retryButton = renderer.root.findByProps({
    accessibilityLabel: 'Thử lại',
  });
  await act(async () => retryButton.props.onPress());
  expect(retry).toHaveBeenCalledTimes(1);
  const backButton = renderer.root.findByProps({
    accessibilityLabel: 'Quay lại',
  });
  await act(async () => backButton.props.onPress({}));
  expect(back).toHaveBeenCalledTimes(1);
  await act(async () => renderer.unmount());
});
test('StatusBadge maps supported assignment statuses and EmptyState supports a title', async () => {
  let renderer;
  await act(async () => {
    renderer = Renderer.create(
      <>
        <StatusBadge status="todo" />
        <StatusBadge status="in_progress" />
        <StatusBadge status="completed" />
        <EmptyState title="No matches" message="Try another search." />
      </>,
    );
  });
  const text = JSON.stringify(renderer.toJSON());
  expect(text).toContain('Chưa thực hiện');
  expect(text).toContain('Đang thực hiện');
  expect(text).toContain('Đã hoàn thành');
  expect(text).toContain('No matches');
  expect(text).toContain('Try another search.');
  await act(async () => renderer.unmount());
});
test('shared layout components render their content accessibly', async () => {
  let renderer;
  const onPress = jest.fn();
  const onSearchChange = jest.fn();
  await act(async () => {
    renderer = Renderer.create(
      <>
        <Header
          eyebrow="OVERVIEW"
          title="Study"
          subtitle="Your learning plan"
        />
        <Section title="Details">
          <Card>
            <Badge label="Ready" variant="success" />
            <Row label="Credits" value="3" />
          </Card>
        </Section>
        <SearchBar value="query" onChangeText={onSearchChange} />
        <EmptyState message="Nothing here yet" />
        <PressableCard onPress={onPress} accessibilityLabel="Open item">
          <Badge label="Item" />
        </PressableCard>
      </>,
    );
  });
  const rendered = JSON.stringify(renderer.toJSON());
  expect(rendered).toContain('OVERVIEW');
  expect(rendered).toContain('Study');
  expect(rendered).toContain('Your learning plan');
  expect(rendered).toContain('Details');
  expect(rendered).toContain('Tìm kiếm…');
  const search = renderer.root.findByProps({ accessibilityLabel: 'Tìm kiếm' });
  await act(async () => search.props.onChangeText('new query'));
  expect(onSearchChange).toHaveBeenCalledWith('new query');
  expect(rendered).toContain('Credits');
  expect(rendered).toContain('Nothing here yet');
  const button = renderer.root.findByProps({ accessibilityLabel: 'Open item' });
  await act(async () => button.props.onPress());
  expect(onPress).toHaveBeenCalledTimes(1);
  await act(async () => renderer.unmount());
});
